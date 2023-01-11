const { app, BrowserWindow, Menu, ipcMain, desktopCapturer } = require('electron');
const tf = require('@tensorflow/tfjs');
const tfNode = require('@tensorflow/tfjs-node');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';

let mainWindow;
let model;
tf.loadLayersModel('file://models/ES_v1/model.json').then((val) => model = val);

// Crete the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Lewis Lab Eye Scorer',
    width: isDev ? 750 : 500,
    height: 800,
    icon: path.join(__dirname, './renderer/images/LLES-icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
    }
  });

  // Open devtools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/main.html'));

  return mainWindow
}

// Create the about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    autoHideMenuBar: true,
    title: 'About Lewis Lab Eye Scorer',
    width: 300,
    height: 300
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// Create the source select window
function createSourceSelectWindow() {
  const SourceSelectWindow = new BrowserWindow({
    autoHideMenuBar: true,
    title: 'Source Select',
    width: 400,
    height: 400
  });

  SourceSelectWindow.loadFile(path.join(__dirname, './renderer/source-select.html'));
}

// Open the source select window
ipcMain.on('openSrcSelect', createSourceSelectWindow);

// App is ready
app.whenReady().then(() => {
  mainWindow = createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on('closed', () => (mainWindow = null));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
      window.webContents.send('ping', 'whoooooooh!')
    }
  });
});

// Catergorize and display a frame
ipcMain.on('catFrame', async (event, array) => {

  var tensor = tf.tensor(array).reshape([1, 64, 64, 3]);
  var prediction = model.predict(tensor);

  prediction = await prediction.array();

  if (prediction[0][0] >= prediction[0][1]) {
    // Eyes are closed
    event.sender.send('results', '0');
    console.log('Eyes Closed');
  } else {
    // Eyes are open
    event.sender.send('results', '9');
    console.log('Eyes Open');
  }

});

// Get the available video sources
ipcMain.on('getVideoSources', (event) => getVideoSources(event));

async function getVideoSources(event) {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => event.sender.send('selectSource', source),
      };
    })
  );


  videoOptionsMenu.popup();
}

// Menu template
const menu = [
  ...(isMac ? [
    {
      label: app.name,
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        }
      ]
    }
  ] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : [])
];

// Quit the application
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});

