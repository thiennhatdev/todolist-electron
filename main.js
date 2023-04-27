const { app } = require('electron');
const path = require('path');
const { createAuthWindow } = require('./main/auth-process');
const createAppWindow = require('./main/app-process');
const getmac = require('getmac');
const keytar = require('keytar');
const macaddress = require('macaddress');

require('dotenv').config();

const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

const user  = {
  name: 'admin12345',
  pw: '12345678910111213'
}

async function showWindow() {
  try {
    const  macAddrs = ['C8:D3:FF:71:E1:CE','F0:D5:BF:4B:2A:F9', 'F0:D5:BF:4B:2A:F8'];
  // keytar.setPassword(macAddr, user.name, user.pw);
  
  macAddrs.forEach(function(macAddr) {
    keytar.setPassword(macAddr, user.name, user.pw);
  })
  let arrPromise = [];

  macaddress.all(function (err, all) {
    Object.values(all).forEach(item => {
      const secret = keytar.getPassword(item.mac.toUpperCase() || '982kjshdf8234', user.name);
      arrPromise.push(secret);
    })
    
    Promise.all(arrPromise).then(data => {
      let pass = data.find(item => item);
      if (pass === user.pw) {
        createAppWindow();
      } else {
        createAuthWindow();
      }
    })
  });
  } catch (err) {
    createAuthWindow()
  }
}


app.whenReady().then(() => {
  showWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
}); 
