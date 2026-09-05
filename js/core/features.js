(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.EduStatsFeatures = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function numericMark(value, subject, subjectMaxMarks, missingMarkMode) {
    if (value === '' || value === null || value === undefined) {
      return missingMarkMode === 'zero' ? 0 : null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    const max = Math.max(1, Number(subjectMaxMarks?.[subject]) || 100);
    return Math.min(max, Math.max(0, parsed));
  }

  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  function stdDev(values) {
    if (values.length < 2) return 0;
    const average = mean(values);
    return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
  }

  function gradeForScore(score, gradeScale) {
    const hit = gradeScale.find(band => score >= Number(band.minMark));
    return hit ? bandLabel(hit) : bandLabel(gradeScale[gradeScale.length - 1]);
  }

  function bandLabel(band) {
    return String(band?.label || 'U');
  }

  function extractStudentFeatures(input, student) {
    const data = input || {};
    const subjects = Array.isArray(data.subjects) ? data.subjects : [];
    const students = Array.isArray(data.students) ? data.students : [];
    const classValues = subjects.map(subject => students
      .map(candidate => numericMark(candidate?.marks?.[subject], subject, data.subjectMaxMarks, data.missingMarkMode))
      .filter(value => value !== null));
    const studentValues = subjects.map(subject => numericMark(student?.marks?.[subject], subject, data.subjectMaxMarks, data.missingMarkMode));
    const normalized = studentValues.map((value, index) => {
      if (value === null) return 0;
      const subject = subjects[index];
      return (value / Math.max(1, Number(data.subjectMaxMarks?.[subject]) || 100)) * 100;
    });
    const validNormalized = normalized.filter((value, index) => studentValues[index] !== null);
    const subjectFeatures = subjects.map((subject, index) => {
      const values = classValues[index];
      const value = studentValues[index];
      const max = Math.max(1, Number(data.subjectMaxMarks?.[subject]) || 100);
      const score = value === null ? 0 : (value / max) * 100;
      const classMean = mean(values.map(item => (item / max) * 100)) ?? 0;
      const classStd = stdDev(values.map(item => (item / max) * 100));
      const zScore = classStd > 0 ? (score - classMean) / classStd : 0;
      const passMark = Number(data.subjectFailMarks?.[subject]);
      const passRate = values.length ? values.filter(item => item >= (Number.isFinite(passMark) ? passMark : max * 0.4)).length / values.length : 0;
      return { subject, score, zScore, classMean, classStd, passRate };
    });
    const scoreMean = mean(validNormalized) ?? 0;
    const history = Array.isArray(data.history) ? data.history : [];
    const previous = history.find(entry => entry.studentId === student?.id && Number.isFinite(Number(entry.mean)));
    const velocity = previous ? scoreMean - Number(previous.mean) : 0;
    const variance = stdDev(validNormalized);
    const vector = [
      scoreMean / 100,
      velocity / 100,
      variance / 100,
      ...subjectFeatures.flatMap(feature => [feature.score / 100, feature.zScore, 1 - feature.passRate])
    ];
    return {
      studentId: String(student?.id || ''),
      vector: vector.map(value => Number.isFinite(value) ? Number(value.toFixed(6)) : 0),
      normalizedMarks: normalized,
      mean: scoreMean,
      velocity,
      variance,
      subjectFeatures
    };
  }

  function extractFeatures(input) {
    const data = input || {};
    return (Array.isArray(data.students) ? data.students : []).map(student => extractStudentFeatures(data, student));
  }

  function buildHeuristicPrediction(features, options) {
    const safeFeatures = features && typeof features === 'object' ? features : {};
    const data = options || {};
    const gradeScale = Array.isArray(data.gradeScale) && data.gradeScale.length
      ? [...data.gradeScale].sort((a, b) => Number(b.minMark) - Number(a.minMark))
      : [{ label: 'A+', minMark: 90 }, { label: 'A', minMark: 80 }, { label: 'B', minMark: 70 }, { label: 'C', minMark: 60 }, { label: 'D', minMark: 50 }, { label: 'U', minMark: 0 }];
    const meanValue = Number.isFinite(Number(safeFeatures.mean)) ? Number(safeFeatures.mean) : 0;
    const velocityValue = Number.isFinite(Number(safeFeatures.velocity)) ? Number(safeFeatures.velocity) : 0;
    const varianceValue = Number.isFinite(Number(safeFeatures.variance)) ? Math.max(0, Number(safeFeatures.variance)) : 0;
    const predictedScore = Math.max(0, Math.min(100, meanValue + (velocityValue * 0.35)));
    const grade = gradeForScore(predictedScore, gradeScale);
    const failMark = Number.isFinite(Number(data.failThreshold)) ? Number(data.failThreshold) : 40;
    const riskScore = Math.max(0, Math.min(1, (failMark - predictedScore) / Math.max(1, failMark) + (varianceValue / 100) * 0.15));
    const probabilities = {};
    gradeScale.forEach((band, index) => { probabilities[bandLabel(band)] = bandLabel(band) === grade ? 0.7 : Number((0.3 / Math.max(1, gradeScale.length - 1)).toFixed(4)); });
    return {
      studentId: String(safeFeatures.studentId || ''),
      predictedScore: Number(predictedScore.toFixed(2)),
      predictedGrade: grade,
      confidenceInterval: [Number(Math.max(0, predictedScore - 6).toFixed(2)), Number(Math.min(100, predictedScore + 6).toFixed(2))],
      probabilities,
      riskScore: Number(riskScore.toFixed(4)),
      atRisk: riskScore >= 0.35 || predictedScore < failMark,
      intervention: predictedScore < failMark ? 'Immediate diagnostic review and targeted support' : riskScore >= 0.35 ? 'Monitor next assessment and target weakest subjects' : 'Continue current learning plan',
      source: 'heuristic-fallback'
    };
  }

  return { extractStudentFeatures, extractFeatures, buildHeuristicPrediction };
});
