// Global state
let mediaRecorder; // MediaRecorder instance to capture footage

// Sections
const welcome = document.getElementById('welcome');
const main = document.getElementById('main');

// Video
const videoElement = document.getElementById('recording');

// Buttons
const startupBtn = document.getElementById('startupBtn');
startupBtn.onclick = e => {
  main.removeAttribute("hidden"); 
};

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
  mediaRecorder.start(2000);
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// Get the available video sources
function getVideoSources() {
  ipcRenderer.send('getVideoSources');
  ipcRenderer.on('selectSource', (source) => selectSource(source));

}

// Change the videoSource window to record
async function selectSource(source) {

  winName = source.name;
  videoSelectBtn.innerText = winName;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // Create a Stream
  stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: 'video/webm' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;

  // Updates the UI
}

// Sends data for categorization for every timeslice
async function handleDataAvailable(e) {
  var array = await tf.fromPixels(videoElement); 
  ipcRenderer.send('catFrame', array);
}

// Displaying the eye score
ipcRenderer.on('eyesOpen', (open) => {
  const display = document.getElementById('result');
  if (open) {
    display.innerText = 'Eye Score: 9';
  } else {
    display.innerText = 'Eye Score: 0';
  }
})

function startStream() {
  ipcRenderer.send('stream:start');
}

function openSourceSelectWindow() {
  ipcRenderer.send('openSrcSelect');
}

// Event listensers

// Select Source 
//selectSrcBtn.addEventListener('click', openSourceSelectWindow);
