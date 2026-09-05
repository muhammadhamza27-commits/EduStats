'use strict';

let Features = null;
let ort = null;
let session = null;

try {
  importScripts('./features.js');
  Features = self.EduStatsFeatures;
} catch (err) {
  self.postMessage({ ok: false, error: `Feature module failed to load: ${err.message}` });
}

async function loadModel(modelPath) {
  if (!modelPath || typeof importScripts !== 'function') return false;
  try {
    importScripts('./lib/ort.min.js');
    ort = self.ort;
    if (!ort?.InferenceSession) return false;
    session = await ort.InferenceSession.create(modelPath);
    return true;
  } catch {
    return false;
  }
}

self.onmessage = async event => {
  const message = event.data || {};
  try {
    if (!Features) throw new Error('Feature module is unavailable');
    if (message.type === 'init') {
      const loaded = await loadModel(message.modelPath || '../models/edustats_v2.onnx');
      self.postMessage({ ok: true, type: 'ready', modelLoaded: loaded, source: loaded ? 'onnx' : 'heuristic-fallback' });
      return;
    }
    if (message.type !== 'predict') throw new Error('Unknown ML worker message');
    const input = message.input || {};
    const features = Features.extractFeatures(input);
    if (session && ort) {
      const tensor = new ort.Tensor('float32', Float32Array.from(features.flatMap(item => item.vector)), [features.length, features[0]?.vector.length || 0]);
      const result = await session.run({ features: tensor });
      self.postMessage({ ok: true, type: 'prediction', predictions: result });
      return;
    }
    const predictions = features.map(item => Features.buildHeuristicPrediction(item, input));
    self.postMessage({ ok: true, type: 'prediction', predictions, source: 'heuristic-fallback' });
  } catch (err) {
    self.postMessage({ ok: false, error: err?.message || String(err) });
  }
};
