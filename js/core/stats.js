(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.EduStatsStats = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_GRADE_SCALE = Object.freeze([
    { label: 'A+', minMark: 90 },
    { label: 'A', minMark: 80 },
    { label: 'B', minMark: 70 },
    { label: 'C', minMark: 60 },
    { label: 'D', minMark: 50 }
  ]);

  function clean(arr) {
    return arr.map(Number).filter(v => !Number.isNaN(v));
  }

  function mean(arr) {
    const a = clean(arr);
    if (!a.length) return null;
    return a.reduce((s, v) => s + v, 0) / a.length;
  }

  function median(arr) {
    const a = [...clean(arr)].sort((x, y) => x - y);
    if (!a.length) return null;
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  function mode(arr) {
    const a = clean(arr);
    if (!a.length) return null;
    const freq = {};
    a.forEach(v => {
      freq[v] = (freq[v] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(freq));
    if (maxFreq === 1) return null;
    return Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
  }

  function quartile(sorted, p) {
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  }

  function boxStats(arr) {
    const a = [...clean(arr)].sort((x, y) => x - y);
    if (a.length < 2) return null;
    const q1 = quartile(a, 25);
    const q2 = quartile(a, 50);
    const q3 = quartile(a, 75);
    const iqr = q3 - q1;
    return {
      min: a[0],
      q1,
      q2,
      q3,
      max: a[a.length - 1],
      iqr,
      fence_lo: q1 - 1.5 * iqr,
      fence_hi: q3 + 1.5 * iqr
    };
  }

  function stdDev(arr) {
    const a = clean(arr);
    if (a.length < 2) return 0;
    const m = mean(a);
    return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
  }

  function normalizeMarks(values, maxMark) {
    const max = Math.max(1, Number(maxMark) || 100);
    return values.map(v => (v / max) * 100);
  }

  function defaultFailMark(maxMark) {
    const max = Math.max(1, Number(maxMark) || 100);
    return Number((max * 0.4).toFixed(1));
  }

  function sanitizeGradeScale(scaleLike) {
    const source = Array.isArray(scaleLike) && scaleLike.length ? scaleLike : DEFAULT_GRADE_SCALE;
    const seen = new Set();
    const cleaned = [];

    source.forEach((item, idx) => {
      const rawLabel = typeof item?.label === 'string' ? item.label.trim() : '';
      const label = (rawLabel || `GRADE ${idx + 1}`).toUpperCase().slice(0, 20);
      if (seen.has(label)) return;
      seen.add(label);
      const parsed = Number(item?.minMark);
      const minMark = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : Math.max(0, 100 - (idx * 10));
      cleaned.push({ label, minMark: Number(minMark.toFixed(1)) });
    });

    if (!cleaned.length) {
      return DEFAULT_GRADE_SCALE.map(item => ({ ...item }));
    }

    return cleaned.sort((a, b) => b.minMark - a.minMark);
  }

  function resolveGradeFromMean(meanValue, gradeScale) {
    const numericMean = Number(meanValue);
    if (!Number.isFinite(numericMean)) return '—';
    const hit = gradeScale.find(item => numericMean >= item.minMark);
    return hit ? hit.label : gradeScale[gradeScale.length - 1].label;
  }

  function resolveSubjectMax(subjectMaxMarks, subject) {
    const maxRaw = Number(subjectMaxMarks?.[subject]);
    return Math.max(1, Number.isFinite(maxRaw) ? maxRaw : 100);
  }

  function resolveSubjectFail(subjectFailMarks, subjectMaxMarks, subject) {
    const maxMark = resolveSubjectMax(subjectMaxMarks, subject);
    const failRaw = Number(subjectFailMarks?.[subject]);
    const fallback = defaultFailMark(maxMark);
    const fail = Number.isFinite(failRaw) ? failRaw : fallback;
    return Math.min(maxMark, Math.max(0, fail));
  }

  function normalizeMissingMarkMode(mode) {
    return mode === 'zero' ? 'zero' : 'exclude';
  }

  function isBlankMark(value) {
    return value === '' || value === undefined || value === null;
  }

  function resolveMarkValue(raw, subject, subjectMaxMarks, missingMarkMode) {
    if (isBlankMark(raw)) {
      return missingMarkMode === 'zero' ? 0 : null;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    const max = resolveSubjectMax(subjectMaxMarks, subject);
    return Math.min(max, Math.max(0, parsed));
  }

  function computeAnalysis(input) {
    const { students, subjects, subjectMaxMarks, subjectFailMarks, gradeScale, missingMarkMode } = input || {};

    if (!Array.isArray(students) || !Array.isArray(subjects) || !students.length || !subjects.length) {
      return null;
    }

    const activeMissingMode = normalizeMissingMarkMode(missingMarkMode);
    const activeGradeScale = sanitizeGradeScale(gradeScale);

    const studentStats = students.map(student => {
      let missingCount = 0;

      const vals = subjects
        .map(subj => {
          const raw = student?.marks?.[subj];
          if (isBlankMark(raw)) missingCount += 1;
          const resolved = resolveMarkValue(raw, subj, subjectMaxMarks, activeMissingMode);
          return resolved === null ? NaN : resolved;
        })
        .filter(v => !Number.isNaN(v));

      const normalizedVals = subjects
        .map(subj => {
          const resolved = resolveMarkValue(student?.marks?.[subj], subj, subjectMaxMarks, activeMissingMode);
          if (resolved === null) return NaN;
          return (resolved / resolveSubjectMax(subjectMaxMarks, subj)) * 100;
        })
        .filter(v => !Number.isNaN(v));

      const meanValue = normalizedVals.length ? mean(normalizedVals) : null;
      return {
        ...student,
        validMarks: vals,
        normalizedMarks: normalizedVals,
        missingCount,
        mean: meanValue,
        grade: resolveGradeFromMean(meanValue, activeGradeScale)
      };
    });

    const gradeDistribution = activeGradeScale.map(band => ({
      label: band.label,
      minMark: band.minMark,
      count: 0
    }));

    studentStats.forEach(student => {
      const hit = gradeDistribution.find(item => item.label === student.grade);
      if (hit) hit.count += 1;
    });

    const subjectStats = {};
    subjects.forEach(subj => {
      const entries = studentStats
        .map(s => {
          const resolved = resolveMarkValue(s?.marks?.[subj], subj, subjectMaxMarks, activeMissingMode);
          return { id: s.id, name: s.name, value: resolved };
        })
        .filter(e => e.value !== null && !Number.isNaN(e.value));

      const vals = entries.map(e => e.value);
      const normalizedVals = normalizeMarks(vals, subjectMaxMarks?.[subj]);
      const failMark = resolveSubjectFail(subjectFailMarks, subjectMaxMarks, subj);
      const failThresholdPct = (failMark / resolveSubjectMax(subjectMaxMarks, subj)) * 100;
      const box = boxStats(normalizedVals);
      const outliers = box
        ? entries.filter((entry, i) => normalizedVals[i] < box.fence_lo || normalizedVals[i] > box.fence_hi)
        : [];
      const failingEntries = entries.filter(entry => entry.value < failMark);
      const failCount = failingEntries.length;
      const passCount = entries.length - failCount;
      const passRate = entries.length ? (100 * passCount) / entries.length : null;
      const failRate = entries.length ? (100 * failCount) / entries.length : null;

      subjectStats[subj] = {
        entries,
        vals,
        failMark,
        failThresholdPct,
        failingEntries,
        failCount,
        passCount,
        passRate,
        failRate,
        rawMean: mean(vals),
        mean: mean(normalizedVals),
        rawMedian: median(vals),
        median: median(normalizedVals),
        mode: mode(normalizedVals),
        stdDev: stdDev(normalizedVals),
        box,
        outliers,
        count: vals.length
      };
    });

    const means = studentStats.filter(s => s.mean !== null).map(s => s.mean);
    const classBox = boxStats(means);

    const sorted = [...studentStats]
      .filter(s => s.mean !== null)
      .sort((a, b) => b.mean - a.mean);
    sorted.forEach((s, i) => {
      s.rank = i + 1;
    });

    const lowerQ = classBox ? studentStats.filter(s => s.mean !== null && s.mean < classBox.q1) : [];
    const topQ = classBox ? studentStats.filter(s => s.mean !== null && s.mean > classBox.q3) : [];
    const botQ = classBox ? studentStats.filter(s => s.mean !== null && s.mean < classBox.q1) : [];
    const meanOutliers = classBox
      ? studentStats.filter(s => s.mean !== null && (s.mean < classBox.fence_lo || s.mean > classBox.fence_hi))
      : [];

    const totals = subjects.reduce((acc, subj) => {
      const ss = subjectStats[subj];
      acc.totalAssessments += ss.count;
      acc.totalPasses += ss.passCount;
      acc.totalFails += ss.failCount;
      return acc;
    }, { totalAssessments: 0, totalPasses: 0, totalFails: 0 });

    const overallPassRate = totals.totalAssessments ? (100 * totals.totalPasses) / totals.totalAssessments : null;
    const overallFailRate = totals.totalAssessments ? (100 * totals.totalFails) / totals.totalAssessments : null;
    const studentsWithMissingMarks = studentStats.filter(s => s.missingCount > 0).length;
    const totalMissingMarks = studentStats.reduce((sum, s) => sum + (s.missingCount || 0), 0);

    return {
      studentStats,
      subjectStats,
      gradeScale: activeGradeScale,
      gradeDistribution,
      classBox,
      sorted,
      lowerQ,
      topQ,
      botQ,
      meanOutliers,
      classMean: mean(means),
      classMedian: median(means),
      classMeans: means,
      missingMarkMode: activeMissingMode,
      studentsWithMissingMarks,
      totalMissingMarks,
      totalAssessments: totals.totalAssessments,
      totalPasses: totals.totalPasses,
      totalFails: totals.totalFails,
      overallPassRate,
      overallFailRate
    };
  }

  return {
    DEFAULT_GRADE_SCALE,
    clean,
    mean,
    median,
    mode,
    quartile,
    boxStats,
    stdDev,
    normalizeMarks,
    defaultFailMark,
    sanitizeGradeScale,
    resolveGradeFromMean,
    resolveSubjectMax,
    resolveSubjectFail,
    normalizeMissingMarkMode,
    resolveMarkValue,
    computeAnalysis
  };
});
