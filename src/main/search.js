const fs = require('fs').promises;
const path = require('path');

const DRIVE_CONFIG = {
  'G:': { basePath: 'G:\\', yearFilter: /^\d{4}$/, levels: 3 },
  'J:': { basePath: 'J:\\', yearFilter: null, levels: 2 },
  'R:': { basePath: 'R:\\Projects', yearFilter: /^\d{4}$/, levels: 3 },
};

class SearchEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getDirectories(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      return [];
    }
  }

  async getCachedDirectories(dirPath) {
    const cached = this.cache.get(dirPath);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.directories;
    }

    const directories = await this.getDirectories(dirPath);
    this.cache.set(dirPath, {
      directories,
      timestamp: Date.now()
    });
    return directories;
  }

  async traverse(basePath, yearFilter, levels) {
    const years = await this.getCachedDirectories(basePath);
    for (const year of years) {
      if (yearFilter && !yearFilter.test(year)) continue;
      const yearPath = path.join(basePath, year);
      if (levels === 3) {
        const thousands = await this.getCachedDirectories(yearPath);
        for (const thousand of thousands) {
          const thousandPath = path.join(yearPath, thousand);
          await this.getCachedDirectories(thousandPath);
        }
      } else {
        await this.getCachedDirectories(yearPath);
      }
    }
  }

  async warmCache(drive) {
    const config = DRIVE_CONFIG[drive];
    if (!config) return;
    return this.traverse(config.basePath, config.yearFilter, config.levels);
  }

  async warmAll() {
    for (const drive of Object.keys(DRIVE_CONFIG)) {
      await this.warmCache(drive);
    }
  }

  serializeIndex() {
    const out = {};
    for (const [dirPath, entry] of this.cache) {
      out[dirPath] = { directories: entry.directories };
    }
    return out;
  }

  loadIndex(obj) {
    const now = Date.now();
    for (const [dirPath, entry] of Object.entries(obj)) {
      this.cache.set(dirPath, { directories: entry.directories, timestamp: now });
    }
  }

  async search(drive, query) {
    if (!query || query.trim() === '') {
      return [];
    }

    const config = DRIVE_CONFIG[drive];
    if (!config) return [];

    const results = [];
    const years = await this.getCachedDirectories(config.basePath);

    for (const year of years) {
      if (config.yearFilter && !config.yearFilter.test(year)) continue;

      const yearPath = path.join(config.basePath, year);

      if (config.levels === 3) {
        const thousands = await this.getCachedDirectories(yearPath);
        for (const thousand of thousands) {
          const thousandPath = path.join(yearPath, thousand);
          const projects = await this.getCachedDirectories(thousandPath);
          for (const project of projects) {
            if (project.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                path: path.join(thousandPath, project),
                name: project,
                year: year.replace('_', '')
              });
            }
          }
        }
      } else {
        const projects = await this.getCachedDirectories(yearPath);
        for (const project of projects) {
          if (project.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path: path.join(yearPath, project),
              name: project,
              year: year.replace('_', '')
            });
          }
        }
      }
    }

    return results;
  }
}

module.exports = SearchEngine;
