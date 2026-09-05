(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.EduStatsDB = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DB_NAME = 'edustats_predictive_v2';
  const STORE_NAME = 'terms';
  const FALLBACK_KEY = 'eduStats_predictive_terms_v2';

  function fallbackRead() {
    try { const value = JSON.parse(localStorage.getItem(FALLBACK_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
  }

  function open() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB could not open'));
    });
  }

  async function saveTerm(term) {
    const record = { ...term, savedAt: new Date().toISOString() };
    try {
      const db = await open();
      await new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).add(record);
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });
      db.close();
    } catch {
      const entries = fallbackRead();
      entries.push(record);
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(entries.slice(-50)));
    }
    return record;
  }

  async function listTerms(studentId) {
    try {
      const db = await open();
      const entries = await new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return studentId ? entries.filter(entry => entry.studentId === studentId) : entries;
    } catch {
      const entries = fallbackRead();
      return studentId ? entries.filter(entry => entry.studentId === studentId) : entries;
    }
  }

  return { saveTerm, listTerms };
});
