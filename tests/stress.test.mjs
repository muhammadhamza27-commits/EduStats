import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Stats = require('../js/core/stats.js');
const CSV = require('../js/core/csv-utils.js');
const Features = require('../js/core/features.js');

function buildCohort(studentCount = 500, subjectCount = 12) {
  const subjects = Array.from({ length: subjectCount }, (_, index) => `Subject ${index + 1}`);
  const subjectMaxMarks = Object.fromEntries(subjects.map(subject => [subject, 100]));
  const subjectFailMarks = Object.fromEntries(subjects.map(subject => [subject, 40]));
  const students = Array.from({ length: studentCount }, (_, studentIndex) => ({
    id: `S-${String(studentIndex + 1).padStart(4, '0')}`,
    name: `Student ${studentIndex + 1}`,
    marks: Object.fromEntries(subjects.map((subject, subjectIndex) => {
      if ((studentIndex + subjectIndex) % 17 === 0) return [subject, ''];
      if ((studentIndex + subjectIndex) % 29 === 0) return [subject, 'not-a-mark'];
      return [subject, (studentIndex * 7 + subjectIndex * 11) % 101];
    }))
  }));
  return {
    subjects,
    students,
    subjectMaxMarks,
    subjectFailMarks,
    gradeScale: Stats.DEFAULT_GRADE_SCALE,
    missingMarkMode: 'exclude'
  };
}

test('large cohort analysis stays finite and structurally complete', () => {
  const input = buildCohort();
  const analysis = Stats.computeAnalysis(input);

  assert.ok(analysis);
  assert.equal(analysis.studentStats.length, 500);
  assert.equal(Object.keys(analysis.subjectStats).length, 12);
  assert.equal(analysis.sorted.length, analysis.studentStats.filter(student => student.mean !== null).length);
  assert.ok(Number.isFinite(analysis.classMean));
  assert.ok(Number.isFinite(analysis.overallPassRate));
  analysis.studentStats.forEach(student => {
    if (student.mean !== null) assert.ok(Number.isFinite(student.mean));
    student.normalizedMarks.forEach(mark => assert.ok(Number.isFinite(mark)));
  });
});

test('feature extraction remains finite for missing, invalid, and extreme marks', () => {
  const input = buildCohort(80, 8);
  input.subjectMaxMarks['Subject 1'] = 0;
  input.subjectMaxMarks['Subject 2'] = -20;
  input.subjectFailMarks['Subject 3'] = 1000;
  const features = Features.extractFeatures(input);

  assert.equal(features.length, 80);
  features.forEach(feature => {
    assert.ok(feature.studentId);
    assert.ok(Number.isFinite(feature.mean));
    assert.ok(Number.isFinite(feature.velocity));
    assert.ok(Number.isFinite(feature.variance));
    assert.ok(feature.vector.every(Number.isFinite));
    assert.ok(feature.subjectFeatures.every(subject => Number.isFinite(subject.score) && Number.isFinite(subject.zScore)));
  });
});

test('predictions stay bounded for malformed feature payloads', () => {
  const malformedInputs = [
    {},
    { studentId: 'missing-values' },
    { studentId: 'nan-values', mean: Number.NaN, velocity: Number.NaN, variance: Number.NaN },
    { studentId: 'extreme-values', mean: 1e9, velocity: -1e9, variance: 1e9 }
  ];

  malformedInputs.forEach(input => {
    const prediction = Features.buildHeuristicPrediction(input, {
      gradeScale: [{ label: 'A', minMark: 80 }, { label: 'U', minMark: 0 }],
      failThreshold: 40
    });
    assert.ok(Number.isFinite(prediction.predictedScore));
    assert.ok(prediction.predictedScore >= 0 && prediction.predictedScore <= 100);
    assert.ok(Number.isFinite(prediction.riskScore));
    assert.ok(prediction.riskScore >= 0 && prediction.riskScore <= 1);
    assert.ok(prediction.confidenceInterval.every(Number.isFinite));
    assert.equal(typeof prediction.atRisk, 'boolean');
  });
});

test('CSV parser handles quoted hostile cells without formula execution', () => {
  const csv = [
    '__EDUSTATS_THRESHOLD__,Math,100,40',
    'Student ID,Full Name,Math,Mean',
    'S1,"=HYPERLINK(\"https://example.invalid\")",90,90',
    'S2,"Name, with comma",@,',
    'S3,"Line 1\nLine 2",-5,-5'
  ].join('\n');
  const parsed = CSV.parseEduStatsCsvText(csv, { preferPapa: false });

  assert.equal(parsed.students.length, 3);
  assert.equal(parsed.students[0].name, '=HYPERLINK(https://example.invalid)');
  assert.equal(parsed.students[1].name, 'Name, with comma');
  assert.equal(parsed.students[1].marks.Math, '');
  assert.equal(parsed.students[2].marks.Math, -5);
});

test('CSV roundtrip scales to a large cohort and preserves missing marks', () => {
  const input = buildCohort(300, 10);
  const csv = CSV.buildEduStatsCsv({
    ...input,
    computeStudentMean: student => Object.values(student.marks)
      .map(Number)
      .filter(Number.isFinite)
      .reduce((sum, value, _, values) => sum + value / values.length, 0)
  });
  const parsed = CSV.parseEduStatsCsvText(csv, { preferPapa: false });

  assert.equal(parsed.students.length, 300);
  assert.equal(parsed.subjects.length, 10);
  assert.ok(parsed.students.some(student => Object.values(student.marks).includes('')));
  assert.equal(parsed.subjectMaxMarks['Subject 1'], 100);
});

test('invalid or empty analysis inputs fail safely', () => {
  assert.equal(Stats.computeAnalysis(null), null);
  assert.equal(Stats.computeAnalysis({ students: [], subjects: ['Math'] }), null);
  assert.equal(Stats.computeAnalysis({ students: [{ id: 'S1', marks: {} }], subjects: [] }), null);
  assert.deepEqual(CSV.parseEduStatsRows([]), {
    gradeScale: [],
    subjectMaxMarks: {},
    subjectFailMarks: {},
    subjects: [],
    students: []
  });
});

test('analysis tolerates malformed student records without emitting invalid aggregates', () => {
  const analysis = Stats.computeAnalysis({
    subjects: ['Math', 'English'],
    students: [
      null,
      undefined,
      { id: 'valid', name: 'Valid', marks: { Math: 85, English: 75 } },
      { id: 'missing-marks', marks: null },
      'unexpected-row'
    ],
    subjectMaxMarks: { Math: 100, English: 100 },
    subjectFailMarks: { Math: -100, English: 1000 },
    gradeScale: [
      { label: ' U ', minMark: Number.NaN },
      { label: 'A', minMark: 80 },
      { label: 'A', minMark: 80 }
    ],
    missingMarkMode: 'unknown-mode'
  });

  assert.ok(analysis);
  assert.equal(analysis.studentStats.length, 5);
  assert.ok(analysis.studentStats.every(student => student.mean === null || Number.isFinite(student.mean)));
  assert.ok(analysis.gradeDistribution.every(band => typeof band.label === 'string'));
  assert.ok(Object.values(analysis.subjectStats).every(subject => subject.failCount >= 0));
});
