const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  checkDrive: (drive) => ipcRenderer.invoke('check-drive', drive)
});
