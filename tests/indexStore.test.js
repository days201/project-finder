const fs = require('fs').promises;
const path = require('path');

jest.mock('fs', () => {
  const real = jest.requireActual('fs');
  return { ...real, promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  }};
});

const { loadPersisted, savePersisted, loadBaseline } = require('../src/main/indexStore');

afterEach(() => jest.clearAllMocks());

test('loadPersisted returns parsed JSON when file exists', async () => {
  fs.readFile.mockResolvedValueOnce(JSON.stringify({ 'G:\\': { directories: ['2024'] } }));
  const result = await loadPersisted('C:\\userData');
  expect(fs.readFile).toHaveBeenCalledWith(path.join('C:\\userData', 'index.json'), 'utf8');
  expect(result).toEqual({ 'G:\\': { directories: ['2024'] } });
});

test('loadPersisted returns null when file is missing', async () => {
  fs.readFile.mockRejectedValueOnce(new Error('ENOENT'));
  const result = await loadPersisted('C:\\userData');
  expect(result).toBeNull();
});

test('savePersisted writes JSON to dir/index.json', async () => {
  const obj = { 'G:\\': { directories: ['2024'] } };
  await savePersisted('C:\\userData', obj);
  expect(fs.writeFile).toHaveBeenCalledWith(
    path.join('C:\\userData', 'index.json'),
    JSON.stringify(obj),
    'utf8'
  );
});

test('loadBaseline returns parsed bundled baseline when present', async () => {
  fs.readFile.mockResolvedValueOnce(JSON.stringify({ 'G:\\': { directories: ['2024'] } }));
  const result = await loadBaseline();
  expect(result).toEqual({ 'G:\\': { directories: ['2024'] } });
});

test('loadBaseline returns null when no baseline is bundled', async () => {
  fs.readFile.mockRejectedValueOnce(new Error('ENOENT'));
  const result = await loadBaseline();
  expect(result).toBeNull();
});
