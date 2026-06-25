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

  mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  // Pre-warm the default drive's directory cache so the first typed search
  // doesn't have to traverse the whole tree from scratch. Fire-and-forget:
  // it runs against the same in-process searchEngine cache that search() uses
  // via getCachedDirectories(), so any directory it has finished walking by
  // the time the user pauses typing will return instantly during the search.
  searchEngine.warmCache('G:').catch((err) => {
    console.error('Initial cache warm-up failed for G::', err.message);
  });
});

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

// IPC handler for searching projects
ipcMain.handle('search-projects', async (event, drive, query) => {
  try {
    const results = await searchEngine.search(drive, query);
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message, results: [] };
  }
});

// IPC handler for pre-warming a drive's directory cache. The renderer invokes
// this fire-and-forget on drive changes so the next search() benefits from a
// warm cache. Returns success once the traversal completes (or on error).
ipcMain.handle('warm-cache', async (event, drive) => {
  try {
    await searchEngine.warmCache(drive);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
