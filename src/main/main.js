const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const SearchEngine = require('./search');
const RecentProjectsStorage = require('./storage');
const indexStore = require('./indexStore');

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

function sendSyncStatus(state) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sync-status', state);
  }
}

app.whenReady().then(async () => {
  createWindow();

  // Load persisted or bundled index so the first search is instant.
  const userDataDir = app.getPath('userData');
  let index = await indexStore.loadPersisted(userDataDir);
  if (!index) index = await indexStore.loadBaseline();
  if (index) searchEngine.loadIndex(index);

  // Gate the sync kickoff on did-finish-load so the renderer's sync-status
  // listener is registered before we emit 'syncing' (otherwise the event
  // fires during loadFile and is dropped).
  mainWindow.webContents.once('did-finish-load', () => {
    sendSyncStatus('syncing');
    searchEngine.warmAll()
      .then(async () => {
        await indexStore.savePersisted(userDataDir, searchEngine.serializeIndex());
        sendSyncStatus('done');
      })
      .catch((err) => {
        console.error('Background sync failed:', err.message);
        sendSyncStatus('error');
      });
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

// IPC handler for pre-warming a drive's directory cache (fire-and-forget from renderer).
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
