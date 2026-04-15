import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Stats = require('../js/core/stats.js');
const CSV = require('../js/core/csv-utils.js');

const sample = {
  subjects: ['Math', 'Science'],
  students: [
    { id: 'X1', name: 'Student One', marks: { Math: 80, Science: 75 } },
    { id: 'X2', name: 'Student Two', marks: { Math: 60, Science: 58 } }
  ],
  subjectMaxMarks: { Math: 100, Science: 100 },
  subjectFailMarks: { Math: 40, Science: 40 },
  gradeScale: Stats.DEFAULT_GRADE_SCALE,
  missingMarkMode: 'exclude'
};

const analysis = Stats.computeAnalysis(sample);
if (!analysis || !analysis.classMean) {
  throw new Error('Smoke test failed: analysis core did not return expected output');
}

const csv = CSV.buildEduStatsCsv({
  gradeScale: sample.gradeScale,
  subjects: sample.subjects,
  students: sample.students,
  subjectMaxMarks: sample.subjectMaxMarks,
  subjectFailMarks: sample.subjectFailMarks,
  computeStudentMean: () => null
});

const parsed = CSV.parseEduStatsCsvText(csv, { preferPapa: false });
if (!parsed.subjects.length || parsed.students.length !== 2) {
  throw new Error('Smoke test failed: CSV roundtrip is not healthy');
}

console.log('Domain smoke test passed.');
