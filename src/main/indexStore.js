const fs = require('fs').promises;
const path = require('path');

const BUNDLED_BASELINE_PATH = path.join(__dirname, 'baseline-index.json');

// ponytail: no caching layer — callers re-read; persisted index is small and read once at startup.
async function loadPersisted(dir) {
  try {
    const data = await fs.readFile(path.join(dir, 'index.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function savePersisted(dir, obj) {
  await fs.writeFile(path.join(dir, 'index.json'), JSON.stringify(obj), 'utf8');
}

async function loadBaseline() {
  try {
    const data = await fs.readFile(BUNDLED_BASELINE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

module.exports = { loadPersisted, savePersisted, loadBaseline };
