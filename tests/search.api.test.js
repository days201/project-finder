const SearchEngine = require('../src/main/search.js');

test('SearchEngine exposes only the kept public methods', () => {
  const kept = [
    'getDirectories',
    'getCachedDirectories',
    'traverseGDrive',
    'traverseJDrive',
    'traverseRDrive',
    'warmCache',
    'searchGDrive',
    'searchJDrive',
    'searchRDrive',
    'search',
  ];
  const own = Object.getOwnPropertyNames(SearchEngine.prototype).filter(n => n !== 'constructor');
  expect(own.sort()).toEqual(kept.sort());
});

test('SearchEngine.prototype no longer has clearCache', () => {
  expect(SearchEngine.prototype).not.toHaveProperty('clearCache');
});
