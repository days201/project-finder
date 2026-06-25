jest.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: jest.fn() },
  ipcRenderer: { invoke: jest.fn() },
}));

require('../src/main/preload.js');

const exposed = require('electron').contextBridge.exposeInMainWorld.mock.calls[0][1];

test('electronAPI exposes exactly the kept IPC surface', () => {
  expect(Object.keys(exposed).sort()).toEqual(
    [
      'addRecentProject',
      'clearRecentProjects',
      'getRecentProjects',
      'onSyncStatus',
      'openFolder',
      'searchProjects',
      'warmCache',
    ].sort()
  );
});

test('onSyncStatus is a function', () => {
  expect(typeof exposed.onSyncStatus).toBe('function');
});

test('electronAPI does NOT expose checkDrive', () => {
  expect(exposed).not.toHaveProperty('checkDrive');
});

test('electronAPI does NOT expose clearCache', () => {
  expect(exposed).not.toHaveProperty('clearCache');
});