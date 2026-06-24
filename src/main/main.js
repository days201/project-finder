const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const SearchEngine = require('./search');
const RecentProjectsStorage = require('./storage');

const searchEngine = new SearchEngine();
const storage = new RecentProjectsStorage();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.ico'),
    title: 'Project Finder',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('src/renderer/index.html');
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handler for opening folders
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for checking drive accessibility
ipcMain.handle('check-drive', async (event, drive) => {
  const fs = require('fs').promises;
  try {
    await fs.access(drive);
    return { accessible: true };
  } catch (error) {
    return { accessible: false, error: error.message };
  }
});

// IPC handler for searching projects
ipcMain.handle('search-projects', async (event, drive, query) => {
  try {
    const results = await searchEngine.search(drive, query);
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message, results: [] };
  }
});

// IPC handler for clearing search cache
ipcMain.handle('clear-cache', async () => {
  searchEngine.clearCache();
  return { success: true };
});

// IPC handler for getting recent projects
ipcMain.handle('get-recent-projects', async () => {
  try {
    const projects = await storage.getRecent();
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message, projects: [] };
  }
});

// IPC handler for adding recent project
ipcMain.handle('add-recent-project', async (event, project) => {
  try {
    const projects = await storage.addRecent(project);
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message, projects: [] };
  }
});

// IPC handler for clearing recent projects
ipcMain.handle('clear-recent-projects', async () => {
  try {
    const projects = await storage.clearRecent();
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message, projects: [] };
  }
});
