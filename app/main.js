const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

async function createMainWindow() {
  const isDev = (await import('electron-is-dev')).default; // Dynamically import

  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false, // Disable Node.js integration for security
        contextIsolation: true, // Isolate context to prevent access to Node.js APIs
        preload: path.join(__dirname, 'preload.js'), // Preload script
        enableRemoteModule: false, // Extra security
      },
    });

    const startURL = isDev
      ? 'http://localhost:3000' // Replace with your frontend dev server
      : `file://${path.join(__dirname, '../new-frontend/build/index.html')}`;

    // Load URL and handle failures
    try {
      await mainWindow.loadURL(startURL);
    } catch (err) {
      console.error(`❌ Failed to load URL: ${startURL}`, err.message);
    }

    if (isDev) {
      mainWindow.webContents.openDevTools(); // Open dev tools in development mode
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Failed to load URL (${startURL}): ${errorDescription} (Code: ${errorCode})`);
    });

    mainWindow.webContents.on('dom-ready', () => {
      console.log('✅ Main window DOM is ready');
    });
  } catch (error) {
    console.error('❌ Error creating main window:', error.message);
  }
}

// App lifecycle events
app.on('ready', () => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC communication (optional, for frontend-backend communication)
ipcMain.handle('ping-backend', async (event, args) => {
  try {
    const response = await fetch(`http://localhost:5000/api/${args.endpoint}`, {
      method: args.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: args.body ? JSON.stringify(args.body) : undefined,
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error communicating with backend:', error.message);
    return { success: false, error: error.message };
  }
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception in Electron:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection in Electron:', reason);
});

// Additional debugging for Electron lifecycle
app.on('browser-window-created', () => {
  console.log('✅ A new browser window has been created.');
});

app.on('web-contents-created', () => {
  console.log('✅ WebContents created.');
});
