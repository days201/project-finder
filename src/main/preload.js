const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  checkDrive: (drive) => ipcRenderer.invoke('check-drive', drive),
  searchProjects: (drive, query) => ipcRenderer.invoke('search-projects', drive, query),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),
  addRecentProject: (project) => ipcRenderer.invoke('add-recent-project', project),
  clearRecentProjects: () => ipcRenderer.invoke('clear-recent-projects')
});
