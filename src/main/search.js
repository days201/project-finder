const fs = require('fs').promises;
const path = require('path');

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

  async searchGDrive(query) {
    const results = [];
    const basePath = 'G:\\';
    
    const years = await this.getCachedDirectories(basePath);
    
    for (const year of years) {
      if (!/^\d{4}$/.test(year)) continue;
      
      const yearPath = path.join(basePath, year);
      const thousands = await this.getCachedDirectories(yearPath);
      
      for (const thousand of thousands) {
        const thousandPath = path.join(yearPath, thousand);
        const projects = await this.getCachedDirectories(thousandPath);
        
        for (const project of projects) {
          if (project.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path: path.join(thousandPath, project),
              name: project,
              year: year
            });
          }
        }
      }
    }
    
    return results;
  }

  async searchJDrive(query) {
    const results = [];
    const basePath = 'J:\\';
    
    const years = await this.getCachedDirectories(basePath);
    
    for (const year of years) {
      const yearPath = path.join(basePath, year);
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
    
    return results;
  }

  async searchRDrive(query) {
    const results = [];
    const basePath = 'R:\\Projects';
    
    const years = await this.getCachedDirectories(basePath);
    
    for (const year of years) {
      if (!/^\d{4}$/.test(year)) continue;
      
      const yearPath = path.join(basePath, year);
      const thousands = await this.getCachedDirectories(yearPath);
      
      for (const thousand of thousands) {
        const thousandPath = path.join(yearPath, thousand);
        const projects = await this.getCachedDirectories(thousandPath);
        
        for (const project of projects) {
          if (project.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path: path.join(thousandPath, project),
              name: project,
              year: year
            });
          }
        }
      }
    }
    
    return results;
  }

  async search(drive, query) {
    if (!query || query.trim() === '') {
      return [];
    }

    switch (drive) {
      case 'G:':
        return this.searchGDrive(query);
      case 'J:':
        return this.searchJDrive(query);
      case 'R:':
        return this.searchRDrive(query);
      default:
        return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = SearchEngine;
