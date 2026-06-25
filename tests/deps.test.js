const pkg = require('../package.json');

test('package.json does not declare @electron/rebuild', () => {
  expect(pkg.devDependencies).not.toHaveProperty('@electron/rebuild');
  expect(pkg.dependencies).not.toHaveProperty('@electron/rebuild');
});