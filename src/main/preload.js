const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  checkDrive: (drive) => ipcRenderer.invoke('check-drive', drive),
  searchProjects: (drive, query) => ipcRenderer.invoke('search-projects', drive, query),
  clearCache: () => ipcRenderer.invoke('clear-cache')
});
