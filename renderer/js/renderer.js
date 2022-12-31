
// Global state
let mediaRecorder; // MediaRecorder instance to capture footage

// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
  mediaRecorder.start(10000);
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

  const blob = new Blob([e.data], {
    type: 'video/webm'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  const fileName = 'vid-'.concat(Date.now().toString(), '.webm');
  const filePath = path.join(path.backendDir(), fileName);

  console.log(buffer);

  fs.writeFile(filePath, buffer, () => console.log('video snippet saved successfully!'));
  ipcRenderer.send('catFrame', filePath);

}

function startStream() {
  ipcRenderer.send('stream:start');
}

function openSourceSelectWindow() {
  ipcRenderer.send('openSrcSelect');
}

// Event listensers

// Camera stream start listener
//startBtn.addEventListener('click', startStream);

// Select Source 
//selectSrcBtn.addEventListener('click', openSourceSelectWindow);
