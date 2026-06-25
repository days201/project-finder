const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  searchProjects: (drive, query) => ipcRenderer.invoke('search-projects', drive, query),
  warmCache: (drive) => ipcRenderer.invoke('warm-cache', drive),
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),
  addRecentProject: (project) => ipcRenderer.invoke('add-recent-project', project),
  clearRecentProjects: () => ipcRenderer.invoke('clear-recent-projects'),
  onSyncStatus: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('sync-status', handler);
    return () => ipcRenderer.removeListener('sync-status', handler);
  }
});
