const { app, BrowserWindow, Menu, ipcMain, shell, desktopCapturer } = require('electron');
const { PythonShell } = require('python-shell');
const path = require('path');
const { writeFile, unlink } = require('fs');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

// Crete the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Lewis Lab Eye Scorer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Open devtools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/main.html'));
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
  createMainWindow();

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
ipcMain.on('catFrame', async (event, filePath) => {

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: 'backend',
    args: [filePath],
  };

  PythonShell.run('main.py', options, function (err, results) {
    if(err) throw err;
    for (let i = 0; i < results.length; i++) {
      console.log(results[i]);
      if (results[i] == 'categorization complete') {
        unlink(filePath, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("File removed:", filePath);
          }
        });
      }
    }
  });
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

