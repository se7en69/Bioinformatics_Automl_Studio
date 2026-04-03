const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Auto-updater (only in production)
let autoUpdater = null;
if (app.isPackaged) {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false; // Ask user before downloading
}

// Write startup log
const logPath = path.join(process.env.APPDATA || '', 'bioml-automl', 'startup.log');
try {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, `Starting at ${new Date().toISOString()}\n`);
} catch(e) {}

function log(msg) {
  try {
    fs.appendFileSync(logPath, msg + '\n');
  } catch(e) {}
  console.log(msg);
}

log('Electron loaded');
log('app.isPackaged: ' + app.isPackaged);
log('Version: ' + app.getVersion());

let mainWindow = null;
let backendProcess = null;

// ============ Auto-Update Functions ============
function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.on('checking-for-update', () => {
    log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    log('Update available: ' + info.version);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    log('No updates available');
  });

  autoUpdater.on('download-progress', (progress) => {
    log(`Download progress: ${Math.round(progress.percent)}%`);
    if (mainWindow) {
      mainWindow.setProgressBar(progress.percent / 100);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log('Update downloaded: ' + info.version);
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // Remove progress bar
    }
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. Restart now to install?`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    log('Auto-update error: ' + err.message);
  });

  // Check for updates after app is ready (delay to not slow startup)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log('Update check failed: ' + err.message);
    });
  }, 5000);
}

function createWindow() {
  log('Creating BrowserWindow...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Bioinformatics AutoML Studio'
  });

  log('BrowserWindow created');

  // Load the app
  const indexPath = path.join(__dirname, 'build', 'index.html');
  log('Loading: ' + indexPath);
  log('File exists: ' + fs.existsSync(indexPath));
  
  mainWindow.loadFile(indexPath)
    .then(() => {
      log('Page loaded successfully');
      mainWindow.show();
    })
    .catch((err) => {
      log('Load error: ' + err.message);
    });
  
  mainWindow.setMenuBarVisibility(false);
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log('did-fail-load: ' + errorCode + ' - ' + errorDescription);
  });
  
  mainWindow.on('closed', () => {
    log('Window closed');
    mainWindow = null;
  });
}

async function startBackend() {
  // In production, backend.exe is in resources/backend/
  const backendPath = path.join(process.resourcesPath, 'backend', 'backend.exe');
  
  log('Looking for backend at: ' + backendPath);
  
  if (!fs.existsSync(backendPath)) {
    log('Backend not found: ' + backendPath);
    return false;
  }
  
  const backendDir = path.dirname(backendPath);
  log('Starting backend from: ' + backendDir);
  
  backendProcess = spawn(backendPath, [], {
    cwd: backendDir,
    stdio: 'ignore',
    windowsHide: true
  });
  
  backendProcess.on('exit', (code) => {
    log('Backend exited: ' + code);
    backendProcess = null;
  });
  
  backendProcess.on('error', (err) => {
    log('Backend error: ' + err.message);
  });
  
  // Wait for backend to be ready
  const maxAttempts = 30; // 30 seconds max
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const http = require('http');
      const result = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:8000/health', (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => { req.destroy(); resolve(false); });
      });
      if (result) {
        log('Backend is ready after ' + (i + 1) + ' seconds');
        return true;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  log('Backend failed to start within 30 seconds');
  return false;
}

function stopBackend() {
  if (backendProcess && backendProcess.pid) {
    try {
      process.kill(backendProcess.pid);
    } catch (e) {}
    backendProcess = null;
  }
}

app.whenReady().then(async () => {
  log('App ready - starting backend');
  
  // Start backend and wait for it to be ready
  const backendReady = await startBackend();
  
  if (!backendReady) {
    log('WARNING: Backend may not be ready, but continuing...');
  }
  
  // Create window after backend is ready
  createWindow();
  
  // Setup auto-updater (only in production)
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  app.quit();
});

app.on('before-quit', () => {
  stopBackend();
});
