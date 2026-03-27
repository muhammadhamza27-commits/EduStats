'use strict';

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

function computeAnalysis({ students, subjects, subjectMaxMarks, subjectFailMarks }) {
  if (!Array.isArray(students) || !Array.isArray(subjects) || !students.length || !subjects.length) {
    return null;
  }

  const studentStats = students.map(student => {
    const vals = subjects
      .map(subj => {
        const v = student?.marks?.[subj];
        return v !== '' && v !== undefined && v !== null ? parseFloat(v) : NaN;
      })
      .filter(v => !Number.isNaN(v));

    const normalizedVals = subjects
      .map(subj => {
        const v = student?.marks?.[subj];
        const num = v !== '' && v !== undefined && v !== null ? parseFloat(v) : NaN;
        if (Number.isNaN(num)) return NaN;
        return (num / resolveSubjectMax(subjectMaxMarks, subj)) * 100;
      })
      .filter(v => !Number.isNaN(v));

    return {
      ...student,
      validMarks: vals,
      normalizedMarks: normalizedVals,
      mean: normalizedVals.length ? mean(normalizedVals) : null
    };
  });

  const perSubject = {};
  subjects.forEach(subj => {
    const entries = studentStats
      .map(s => {
        const v = s?.marks?.[subj];
        const num = v !== '' && v !== undefined && v !== null ? parseFloat(v) : NaN;
        return { id: s.id, name: s.name, value: num };
      })
      .filter(e => !Number.isNaN(e.value));

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

    perSubject[subj] = {
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
    const ss = perSubject[subj];
    acc.totalAssessments += ss.count;
    acc.totalPasses += ss.passCount;
    acc.totalFails += ss.failCount;
    return acc;
  }, { totalAssessments: 0, totalPasses: 0, totalFails: 0 });

  const overallPassRate = totals.totalAssessments ? (100 * totals.totalPasses) / totals.totalAssessments : null;
  const overallFailRate = totals.totalAssessments ? (100 * totals.totalFails) / totals.totalAssessments : null;

  return {
    studentStats,
    subjectStats: perSubject,
    classBox,
    sorted,
    lowerQ,
    topQ,
    botQ,
    meanOutliers,
    classMean: mean(means),
    classMedian: median(means),
    classMeans: means,
    totalAssessments: totals.totalAssessments,
    totalPasses: totals.totalPasses,
    totalFails: totals.totalFails,
    overallPassRate,
    overallFailRate
  };
}

self.onmessage = event => {
  try {
    const result = computeAnalysis(event.data || {});
    self.postMessage({ ok: true, result });
  } catch (err) {
    self.postMessage({ ok: false, error: err?.message || String(err) });
  }
};
