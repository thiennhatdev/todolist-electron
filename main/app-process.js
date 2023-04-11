const {app, ipcMain, ipcRenderer, BrowserWindow, Notification, electron} = require('electron');
const path = require('path');
const url = require('url');
const db = require('../db/stores/todoItem');


global.db = db;
let mainWindow;
let addWindow;

function openAddWindow(arg) {

  addWindow = new BrowserWindow({
    // parent: mainWindow,
    modal: true,
    show: false,
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../addWork.html'),
    protocol: 'file:',
    slashes: true
  }))

  addWindow.once('ready-to-show', () => {
    addWindow.show()
    addWindow.webContents.send('item-work', arg);
  })

  addWindow.on('close', () => {
    addWindow = null;
  })
}

function createAppWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1900,
    height: 1000,
    webPreferences: {
    //   preload: path.join(__dirname  , 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
    }
  })

  ipcMain.on('data-from-edit', (event, arg) => {
      openAddWindow(arg);
  });

  ipcMain.on('add-edit-success', (event, arg) => {
    mainWindow.webContents.send('add-edit-success', {})
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow.webContents
  .executeJavaScript(`
    localStorage.removeItem('currentPage');
    `, true)
  .then(localStorage => {
  });
})



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  mainWindow.webContents
  .executeJavaScript(`
    localStorage.removeItem('currentPage');
    `, true)
  .then(localStorage => {
  });
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
  
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

module.exports = createAppWindow;
