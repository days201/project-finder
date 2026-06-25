// Dev-time script: regenerates the bundled baseline index from the live drives.
// Run on a machine with G:, J:, R: access before publishing a release.
const SearchEngine = require('./search');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const engine = new SearchEngine();
  await engine.warmAll();
  const out = engine.serializeIndex();
  const count = Object.keys(out).length;
  if (count === 0) {
    console.error('build-index: no directories indexed — are G:, J:, R: accessible? Aborting.');
    process.exit(1);
  }
  const target = path.join(__dirname, 'baseline-index.json');
  await fs.writeFile(target, JSON.stringify(out, null, 2), 'utf8');
  console.log(`build-index: wrote ${count} indexed directories to ${target}`);
}

main().catch((err) => {
  console.error('build-index failed:', err);
  process.exit(1);
});