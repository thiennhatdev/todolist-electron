const { app, ipcMain, dialog } = require('electron');
const path = require('path');
const { createAuthWindow } = require('./main/auth-process');
const createAppWindow = require('./main/app-process');
const getmac = require('getmac');
const keytar = require('keytar');

require('dotenv').config();

const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

const user  = {
  name: 'admin',
  pw: '123456789'
}
async function showWindow() {
  const macAddr = getmac.default();
  //keytar.setPassword(macAddr, user.name, user.pw);
  const secret = keytar.getPassword(macAddr, user.name);
  //console.log(secret, 'dong 26');
  secret
    .then((result) => {
      //console.log(result, 'lấy đc pasword ở đây...')
        if (result === user.pw) {
          createAppWindow();
        } else {
          createAuthWindow();
        }
    });
  
  
}
app.whenReady().then(() => {
  showWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
}); 
