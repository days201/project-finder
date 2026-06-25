let handleCalls;

beforeEach(() => {
  jest.resetModules();
  handleCalls = [];
  jest.doMock('electron', () => ({
    app: { whenReady: jest.fn(() => ({ then: jest.fn() })), on: jest.fn() },
    BrowserWindow: jest.fn(() => ({ loadFile: jest.fn(), on: jest.fn() })),
    ipcMain: { handle: (channel, fn) => handleCalls.push({ channel, fn }) },
    shell: { openPath: jest.fn() },
  }));
  require('../src/main/main.js');
});

test('check-drive IPC channel is NOT registered', () => {
  expect(handleCalls.map(c => c.channel)).not.toContain('check-drive');
});

test('kept IPC channels remain registered', () => {
  const channels = handleCalls.map(c => c.channel);
  for (const ch of [
    'open-folder',
    'search-projects',
    'warm-cache',
    'get-recent-projects',
    'add-recent-project',
    'clear-recent-projects',
  ]) {
    expect(channels).toContain(ch);
  }
});