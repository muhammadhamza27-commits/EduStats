(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.EduStatsCSV = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function defaultFailMarkForMax(maxMark) {
    const max = Math.max(1, Number(maxMark) || 100);
    return Number((max * 0.4).toFixed(1));
  }

  function safeCell(value) {
    const raw = String(value ?? '');
    if (/^\s*[=+\-@]/.test(raw) || /^\t/.test(raw)) {
      return `'${raw}`;
    }
    return raw;
  }

  function escapeCsvCell(value) {
    const safe = safeCell(value);
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }

  function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQ = false;

    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];

      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQ = !inQ;
        }
        continue;
      }

      if (c === ',' && !inQ) {
        result.push(cur);
        cur = '';
        continue;
      }

      cur += c;
    }

    result.push(cur);
    return result;
  }

  function parseCsvRows(text, opts) {
    const options = opts || {};
    const preferPapa = options.preferPapa !== false;
    const hasPapa = typeof root !== 'undefined' && root.Papa && typeof root.Papa.parse === 'function';

    if (preferPapa && hasPapa) {
      const parsed = root.Papa.parse(text, {
        skipEmptyLines: 'greedy'
      });

      if (Array.isArray(parsed.errors) && parsed.errors.length) {
        const firstErr = parsed.errors[0];
        throw new Error(firstErr.message || 'CSV parsing failed');
      }

      return (parsed.data || []).map(row => row.map(cell => String(cell ?? '')));
    }

    return String(text || '')
      .split(/\r?\n/)
      .map(line => line.trimEnd())
      .filter(line => line.trim().length > 0)
      .map(parseCsvLine);
  }

  function parseEduStatsRows(rows) {
    const parsedRows = Array.isArray(rows) ? rows : [];
    const importedGradeScale = [];
    const importedMaxMarks = {};
    const importedFailMarks = {};

    let headerIndex = 0;
    while (headerIndex < parsedRows.length) {
      const metaCells = parsedRows[headerIndex] || [];
      const metaType = String(metaCells[0] || '').trim();
      if (metaType !== '__EDUSTATS_GRADE__' && metaType !== '__EDUSTATS_THRESHOLD__') break;

      if (metaType === '__EDUSTATS_GRADE__') {
        const label = String(metaCells[1] || '').trim();
        const minMark = Number(metaCells[2]);
        if (label) {
          importedGradeScale.push({
            label,
            minMark: Number.isFinite(minMark) ? Math.min(100, Math.max(0, minMark)) : 100
          });
        }
        headerIndex += 1;
        continue;
      }

      const subject = String(metaCells[1] || '').trim();
      const max = Number(metaCells[2]);
      const fail = Number(metaCells[3]);
      if (subject) {
        importedMaxMarks[subject] = Number.isFinite(max) ? Math.max(1, max) : 100;
        importedFailMarks[subject] = Number.isFinite(fail)
          ? Math.min(importedMaxMarks[subject], Math.max(0, fail))
          : defaultFailMarkForMax(importedMaxMarks[subject]);
      }
      headerIndex += 1;
    }

    if (headerIndex >= parsedRows.length) {
      throw new Error('CSV has no student header row');
    }

    const headers = (parsedRows[headerIndex] || []).map(cell => String(cell || '').trim());
    const meanColIndex = headers.indexOf('Mean');
    const subjCols = headers.slice(2, meanColIndex > -1 ? meanColIndex : headers.length).map(s => s.trim()).filter(Boolean);

    const students = [];
    for (let i = headerIndex + 1; i < parsedRows.length; i += 1) {
      const cells = parsedRows[i] || [];
      const studentId = String(cells[0] || '').trim();
      if (!studentId) continue;

      const marks = {};
      subjCols.forEach((subj, idx) => {
        const raw = cells[idx + 2];
        if (raw === undefined || raw === null || String(raw).trim() === '') {
          marks[subj] = '';
          return;
        }

        const num = Number(raw);
        marks[subj] = Number.isFinite(num) ? num : '';
      });

      students.push({
        id: studentId,
        name: String(cells[1] || '').trim(),
        marks
      });
    }

    return {
      gradeScale: importedGradeScale,
      subjectMaxMarks: importedMaxMarks,
      subjectFailMarks: importedFailMarks,
      subjects: subjCols,
      students
    };
  }

  function parseEduStatsCsvText(text, opts) {
    const rows = parseCsvRows(text, opts);
    return parseEduStatsRows(rows);
  }

  function buildEduStatsCsv(payload) {
    const data = payload || {};
    const gradeScale = Array.isArray(data.gradeScale) ? data.gradeScale : [];
    const subjects = Array.isArray(data.subjects) ? data.subjects : [];
    const students = Array.isArray(data.students) ? data.students : [];
    const subjectMaxMarks = data.subjectMaxMarks || {};
    const subjectFailMarks = data.subjectFailMarks || {};
    const computeStudentMean = typeof data.computeStudentMean === 'function' ? data.computeStudentMean : (() => null);

    let csv = '';

    gradeScale.forEach(band => {
      csv += ['__EDUSTATS_GRADE__', escapeCsvCell(band.label), Number(band.minMark)].join(',') + '\n';
    });

    subjects.forEach(subject => {
      const maxMark = Number(subjectMaxMarks[subject]);
      const failMark = Number(subjectFailMarks[subject]);
      csv += [
        '__EDUSTATS_THRESHOLD__',
        escapeCsvCell(subject),
        Number.isFinite(maxMark) ? maxMark : 100,
        Number.isFinite(failMark) ? failMark : defaultFailMarkForMax(maxMark)
      ].join(',') + '\n';
    });

    csv += ['Student ID', 'Full Name'].concat(subjects).concat(['Mean']).join(',') + '\n';

    students.forEach(student => {
      const mean = computeStudentMean(student);
      const row = [
        escapeCsvCell(student?.id || ''),
        escapeCsvCell(student?.name || '')
      ];

      subjects.forEach(subject => {
        const raw = student?.marks?.[subject];
        row.push(raw === undefined || raw === null ? '' : raw);
      });

      row.push(mean === null || mean === undefined ? '' : String(mean));
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  return {
    parseCsvLine,
    parseCsvRows,
    parseEduStatsRows,
    parseEduStatsCsvText,
    buildEduStatsCsv,
    defaultFailMarkForMax
  };
});
