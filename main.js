const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
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
  win.loadFile('index.html');

  win.webContents.on('before-input-event', (event, input) => {
    const key = (input.key || '').toUpperCase();
    if (input.key === 'F12') return event.preventDefault();
    if ((input.control || input.meta) && input.shift &&
        ['I','J','C','K'].includes(key)) return event.preventDefault();
    if ((input.control || input.meta) && key === 'U') return event.preventDefault();
    if ((input.control || input.meta) && key === 'S') return event.preventDefault();
  });

  win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.session.on('will-download', (event, item) => {
    const savePath = dialog.showSaveDialogSync(win, {
      title: 'Сохранить frontend.xml',
      defaultPath: item.getFilename(),
      filters: [{ name: 'XML', extensions: ['xml'] }]
    });
    if (savePath) item.setSavePath(savePath);
    else item.cancel();
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
