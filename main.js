const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 950,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0e1015',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const key = (input.key || '').toUpperCase();
    if (input.key === 'F12') return event.preventDefault();
    if ((input.control || input.meta) && input.shift &&
        ['I','J','C','K'].includes(key)) return event.preventDefault();
    if ((input.control || input.meta) && key === 'U') return event.preventDefault();
    if ((input.control || input.meta) && key === 'S') return event.preventDefault();
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.session.on('will-download', (event, item) => {
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      title: 'Сохранить frontend.xml',
      defaultPath: item.getFilename(),
      filters: [{ name: 'XML', extensions: ['xml'] }]
    });
    if (savePath) item.setSavePath(savePath);
    else item.cancel();
  });
}

ipcMain.on('open-preview', (event, html) => {
  const previewWin = new BrowserWindow({
    width: 1000,
    height: 800,
    backgroundColor: '#0e1015',
    autoHideMenuBar: true,
    title: 'Предпросмотр frontend.xml',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false
    }
  });
  Menu.setApplicationMenu(null);
  previewWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  previewWin.webContents.on('before-input-event', (e, input) => {
    if (input.key === 'F12') e.preventDefault();
    if ((input.control || input.meta) && input.shift &&
        ['I','J','C','K'].includes((input.key || '').toUpperCase())) e.preventDefault();
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
