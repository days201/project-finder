const SearchEngine = require('../src/main/search.js');

// Helper: replace the engine's internal getDirectories with a stub that
// returns canned directory listings. This lets us test search/traverse
// behavior without touching the real filesystem.
function stubDirectories(engine, tree) {
  engine.getDirectories = async (dirPath) => {
    return tree[dirPath] || [];
  };
}

describe('SearchEngine.search', () => {
  let engine;

  beforeEach(() => {
    engine = new SearchEngine();
  });

  test('returns empty array for empty query', async () => {
    expect(await engine.search('G:', '')).toEqual([]);
    expect(await engine.search('G:', '  ')).toEqual([]);
    expect(await engine.search('G:', null)).toEqual([]);
  });

  test('returns empty array for unknown drive', async () => {
    expect(await engine.search('Z:', 'test')).toEqual([]);
  });

  test('finds projects on G: drive (3-level: year/thousand/project)', async () => {
    stubDirectories(engine, {
      'G:\\': ['2024', '2025', 'notes.txt'],
      'G:\\2024': ['1000', '2000'],
      'G:\\2024\\1000': ['1002-27', '1003-28'],
      'G:\\2024\\2000': ['2001-10'],
      'G:\\2025': ['3000'],
      'G:\\2025\\3000': ['3001-05'],
    });

    const results = await engine.search('G:', '1002');
    expect(results).toEqual([
      { path: 'G:\\2024\\1000\\1002-27', name: '1002-27', year: '2024' },
    ]);
  });

  test('finds projects on J: drive (2-level: year/project)', async () => {
    stubDirectories(engine, {
      'J:\\': ['2024_old', '2025'],
      'J:\\2024_old': ['24-00001', '24-00002'],
      'J:\\2025': ['26-00041'],
    });

    const results = await engine.search('J:', '24-00001');
    expect(results).toEqual([
      { path: 'J:\\2024_old\\24-00001', name: '24-00001', year: '2024old' },
    ]);
  });

  test('finds projects on R: drive (3-level: year/thousand/project)', async () => {
    stubDirectories(engine, {
      'R:\\Projects': ['2024', '2025'],
      'R:\\Projects\\2024': ['3400'],
      'R:\\Projects\\2024\\3400': ['3459-200', '3460-100'],
      'R:\\Projects\\2025': ['3500'],
      'R:\\Projects\\2025\\3500': ['3501-01'],
    });

    const results = await engine.search('R:', '3459');
    expect(results).toEqual([
      { path: 'R:\\Projects\\2024\\3400\\3459-200', name: '3459-200', year: '2024' },
    ]);
  });

  test('search is case-insensitive', async () => {
    stubDirectories(engine, {
      'G:\\': ['2024'],
      'G:\\2024': ['1000'],
      'G:\\2024\\1000': ['MyProject-01'],
    });

    const results = await engine.search('G:', 'myproject');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('MyProject-01');
  });

  test('skips non-year directories at drive root for G: and R:', async () => {
    stubDirectories(engine, {
      'G:\\': ['2024', 'System Volume Information', 'temp'],
      'G:\\2024': ['1000'],
      'G:\\2024\\1000': ['1002-27'],
    });

    const results = await engine.search('G:', '1002');
    expect(results).toHaveLength(1);
  });
});

describe('SearchEngine.warmCache', () => {
  test('populates cache for G: drive', async () => {
    const engine = new SearchEngine();
    const readDirs = [];
    const stub = async (dirPath) => {
      return {
        'G:\\': ['2024', '2025'],
        'G:\\2024': ['1000'],
        'G:\\2024\\1000': ['1002-27'],
        'G:\\2025': ['3000'],
        'G:\\2025\\3000': ['3001-05'],
      }[dirPath] || [];
    };
    engine.getDirectories = async (dirPath) => {
      readDirs.push(dirPath);
      return stub(dirPath);
    };

    await engine.warmCache('G:');
    expect(readDirs).toContain('G:\\');
  });

  test('is a no-op for unknown drives', async () => {
    const engine = new SearchEngine();
    await engine.warmCache('Z:');
  });
});

describe('SearchEngine.serializeIndex / loadIndex', () => {
  test('serializeIndex returns directories keyed by path, without timestamps', async () => {
    const engine = new SearchEngine();
    stubDirectories(engine, {
      'G:\\': ['2024'],
      'G:\\2024': ['1000'],
      'G:\\2024\\1000': ['1002-27'],
    });
    await engine.warmCache('G:');

    const serialized = engine.serializeIndex();
    expect(serialized['G:\\'].directories).toEqual(['2024']);
    expect(serialized['G:\\2024\\1000'].directories).toEqual(['1002-27']);
    expect(serialized['G:\\']).not.toHaveProperty('timestamp');
  });

  test('loadIndex populates cache so search works without touching the filesystem', async () => {
    const engine = new SearchEngine();
    const calls = [];
    engine.getDirectories = async (p) => { calls.push(p); return []; };

    engine.loadIndex({
      'G:\\': { directories: ['2024'] },
      'G:\\2024': { directories: ['1000'] },
      'G:\\2024\\1000': { directories: ['1002-27'] },
    });

    const results = await engine.search('G:', '1002');
    expect(results).toEqual([
      { path: 'G:\\2024\\1000\\1002-27', name: '1002-27', year: '2024' },
    ]);
    expect(calls).toEqual([]);
  });

  test('serializeIndex round-trips through loadIndex', async () => {
    const a = new SearchEngine();
    stubDirectories(a, {
      'G:\\': ['2024'],
      'G:\\2024': ['1000'],
      'G:\\2024\\1000': ['1002-27'],
    });
    await a.warmCache('G:');
    const serialized = a.serializeIndex();

    const b = new SearchEngine();
    b.getDirectories = jest.fn(); // should never be called
    b.loadIndex(serialized);
    const results = await b.search('G:', '1002');
    expect(results).toHaveLength(1);
    expect(b.getDirectories).not.toHaveBeenCalled();
  });
});

describe('SearchEngine.warmAll', () => {
  test('warms every configured drive', async () => {
    const engine = new SearchEngine();
    const readDirs = [];
    engine.getDirectories = async (dirPath) => {
      readDirs.push(dirPath);
      return {
        'G:\\': ['2024'],
        'G:\\2024': ['1000'],
        'G:\\2024\\1000': ['1002-27'],
        'J:\\': ['2025'],
        'J:\\2025': ['26-00041'],
        'R:\\Projects': ['2024'],
        'R:\\Projects\\2024': ['3400'],
        'R:\\Projects\\2024\\3400': ['3459-200'],
      }[dirPath] || [];
    };

    await engine.warmAll();
    expect(readDirs).toContain('G:\\');
    expect(readDirs).toContain('J:\\');
    expect(readDirs).toContain('R:\\Projects');
  });
});
