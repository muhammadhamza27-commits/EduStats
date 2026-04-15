import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Stats = require('../js/core/stats.js');

test('computeAnalysis builds class and subject aggregates', () => {
  const analysis = Stats.computeAnalysis({
    subjects: ['Math', 'English'],
    students: [
      { id: 'S1', name: 'Asha', marks: { Math: 90, English: 80 } },
      { id: 'S2', name: 'Bilal', marks: { Math: 60, English: 50 } },
      { id: 'S3', name: 'Cara', marks: { Math: '', English: 70 } }
    ],
    subjectMaxMarks: { Math: 100, English: 100 },
    subjectFailMarks: { Math: 40, English: 40 },
    gradeScale: Stats.DEFAULT_GRADE_SCALE,
    missingMarkMode: 'exclude'
  });

  assert.ok(analysis);
  assert.equal(analysis.studentStats.length, 3);
  assert.equal(analysis.subjectStats.Math.failCount, 0);
  assert.equal(analysis.subjectStats.English.failCount, 0);
  assert.equal(analysis.studentsWithMissingMarks, 1);
  assert.equal(analysis.totalMissingMarks, 1);
  assert.equal(analysis.gradeDistribution.reduce((sum, g) => sum + g.count, 0), 3);
  assert.equal(analysis.sorted[0].id, 'S1');
  assert.equal(analysis.sorted[0].rank, 1);
});

test('missing zero mode treats blank marks as 0', () => {
  const analysis = Stats.computeAnalysis({
    subjects: ['Math'],
    students: [{ id: 'S1', name: 'Asha', marks: { Math: '' } }],
    subjectMaxMarks: { Math: 100 },
    subjectFailMarks: { Math: 40 },
    gradeScale: Stats.DEFAULT_GRADE_SCALE,
    missingMarkMode: 'zero'
  });

  assert.ok(analysis);
  assert.equal(analysis.studentStats[0].mean, 0);
  assert.equal(analysis.subjectStats.Math.failCount, 1);
  assert.equal(analysis.overallFailRate, 100);
});
