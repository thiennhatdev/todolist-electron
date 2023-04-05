const { BrowserWindow } = require('electron');

let win = null;

function createAuthWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        // preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('confirm.html');

  win.on('closed', () => {
    win = null;
  });
}

module.exports = {
  createAuthWindow,
};