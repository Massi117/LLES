const os = require('os');
const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir()
});

contextBridge.exposeInMainWorld('path', {
    mainDir : () => __dirname,
    backendDir : () => path.join(__dirname, 'backend'),
    join: (...args) => path.join(...args)
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('fs', {
  writeFile: (filePath, buffer, func) => fs.writeFile(filePath, buffer, (...args) => func(...args)),
});

contextBridge.exposeInMainWorld('Buffer', {
  from: (...args) => Buffer.from(...args),
});

contextBridge.exposeInMainWorld('tf', {
  fromPixels: (...args) => tf.browser.fromPixels(...args).resizeBilinear([64, 64]).array(),
});

