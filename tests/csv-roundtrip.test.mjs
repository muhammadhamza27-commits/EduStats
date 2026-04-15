import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CSV = require('../js/core/csv-utils.js');

test('csv roundtrip keeps subjects and students', () => {
  const source = {
    gradeScale: [
      { label: 'A', minMark: 80 },
      { label: 'B', minMark: 70 }
    ],
    subjects: ['Math', 'English'],
    subjectMaxMarks: { Math: 100, English: 100 },
    subjectFailMarks: { Math: 40, English: 40 },
    students: [
      { id: 'S1', name: 'Asha', marks: { Math: 88, English: 76 } },
      { id: 'S2', name: 'Bilal', marks: { Math: '', English: 64 } }
    ],
    computeStudentMean: (student) => {
      const values = Object.values(student.marks)
        .map(v => Number(v))
        .filter(v => Number.isFinite(v));
      if (!values.length) return null;
      return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    }
  };

  const csvText = CSV.buildEduStatsCsv(source);
  const parsed = CSV.parseEduStatsCsvText(csvText, { preferPapa: false });

  assert.deepEqual(parsed.subjects, source.subjects);
  assert.equal(parsed.students.length, 2);
  assert.equal(parsed.students[0].id, 'S1');
  assert.equal(parsed.students[1].marks.Math, '');
  assert.equal(parsed.subjectMaxMarks.Math, 100);
  assert.equal(parsed.subjectFailMarks.English, 40);
});
