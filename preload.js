const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPreview: (html) => ipcRenderer.send('open-preview', html)
});
