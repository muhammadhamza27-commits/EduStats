'use strict';

let computeAnalysis = null;

try {
  importScripts('./js/core/stats.js');
  computeAnalysis = self.EduStatsStats?.computeAnalysis || null;
} catch (err) {
  computeAnalysis = null;
}

self.onmessage = event => {
  try {
    if (typeof computeAnalysis !== 'function') {
      throw new Error('Stats core module was not loaded in worker context');
    }
    const result = computeAnalysis(event.data || {});
    self.postMessage({ ok: true, result });
  } catch (err) {
    self.postMessage({ ok: false, error: err?.message || String(err) });
  }
};
