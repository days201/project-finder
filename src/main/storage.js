const fs = require('fs').promises;
const path = require('path');

class RecentProjectsStorage {
  constructor() {
    this.maxRecent = 5;
    this.storagePath = path.join(
      process.env.APPDATA || process.env.HOME,
      'project-finder',
      'recent.json'
    );
    this.recentProjects = [];
  }

  async load() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      const parsed = JSON.parse(data);
      this.recentProjects = parsed.recentProjects || [];
    } catch (error) {
      this.recentProjects = [];
    }
  }

  async save() {
    try {
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      const data = JSON.stringify({
        recentProjects: this.recentProjects
      }, null, 2);
      
      await fs.writeFile(this.storagePath, data, 'utf8');
    } catch (error) {
      console.error('Error saving recent projects:', error);
    }
  }

  async addRecent(project) {
    await this.load();
    
    // Remove duplicate if exists
    this.recentProjects = this.recentProjects.filter(
      p => p.path !== project.path
    );
    
    // Add to beginning
    this.recentProjects.unshift({
      path: project.path,
      name: project.name,
      drive: project.drive,
      openedAt: new Date().toISOString()
    });
    
    // Keep only last 5
    this.recentProjects = this.recentProjects.slice(0, this.maxRecent);
    
    await this.save();
    return this.recentProjects;
  }

  async getRecent() {
    await this.load();
    return this.recentProjects;
  }

  async clearRecent() {
    this.recentProjects = [];
    await this.save();
    return this.recentProjects;
  }
}

module.exports = RecentProjectsStorage;
