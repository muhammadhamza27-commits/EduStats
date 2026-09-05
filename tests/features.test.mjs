import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Features = require('../js/core/features.js');

const input = {
  subjects: ['Math', 'English'],
  subjectMaxMarks: { Math: 100, English: 100 },
  subjectFailMarks: { Math: 40, English: 40 },
  gradeScale: [{ label: 'A', minMark: 80 }, { label: 'B', minMark: 70 }, { label: 'U', minMark: 0 }],
  students: [
    { id: 'S1', marks: { Math: 80, English: 70 } },
    { id: 'S2', marks: { Math: 40, English: 50 } }
  ]
};

test('feature extraction is normalized and stable', () => {
  const result = Features.extractStudentFeatures(input, input.students[0]);
  assert.equal(result.mean, 75);
  assert.equal(result.subjectFeatures.length, 2);
  assert.ok(result.vector.every(Number.isFinite));
  assert.equal(result.vector[0], 0.75);
});

test('heuristic predictions expose bounded risk and confidence', () => {
  const features = Features.extractStudentFeatures(input, input.students[1]);
  const prediction = Features.buildHeuristicPrediction(features, { ...input, failThreshold: 50 });
  assert.equal(prediction.predictedGrade, 'U');
  assert.ok(prediction.riskScore >= 0 && prediction.riskScore <= 1);
  assert.equal(prediction.confidenceInterval.length, 2);
  assert.equal(prediction.atRisk, true);
});
