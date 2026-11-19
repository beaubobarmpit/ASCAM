const videoElement = document.getElementById('webcam');
const stopButton = document.getElementById('stop-btn');
const startButton = document.getElementById('start-btn');
const density = "$@B%8WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~;:,. ";
const asciiElement = document.getElementById('ascii-output'); // Element to display ASCII art
// 1. Create the canvas in JS and save its 2D context
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Keep a wide character grid to preserve the video proportions in text.
canvas.width = 160;
canvas.height = 72;

let activeStream = null;
let animationId = null; // Stores the loop ID so we can stop it later
let asciiFrame = ""; // Stores the current ASCII frame

async function startCamera() {
    try {
        activeStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false
        });
        videoElement.srcObject = activeStream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}

// 3. The Animation Loop
function renderFrame() {
    // Paint the current video frame onto the tiny canvas
    ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // 4. Convert the pixel data to ASCII
    let asciiFrame = "";
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const brightness = (r + g + b) / 3;
            const charIndex = Math.floor((brightness / 255) * (density.length - 1));
            const char = density[charIndex];

            if (isColor && char !== " ") {
                asciiFrame += `<span style="color: rgb(${r}, ${g}, ${b})">${char}</span>`;
            } else {
                asciiFrame += char;
            }
        }
        asciiFrame += "\n"; // New line at the end of each row
    }

    // 5. Render to the page using the right property
    if (isColor) {
        asciiElement.innerHTML = asciiFrame;
    } else {
        asciiElement.textContent = asciiFrame;
    }

    // Ask the browser to run this function again on the next frame
    animationId = requestAnimationFrame(renderFrame);
}

// Start the loop automatically as soon as the video begins playing
videoElement.addEventListener('play', () => {
    renderFrame();
});

stopButton.addEventListener('click', () => {
    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    // Pause the canvas loop when the camera stops
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
});

startButton.addEventListener('click', () => {
    startCamera();
});

let isColor = false; // Flag to track color mode
const colorButton = document.getElementById('color-btn');
colorButton.addEventListener('click', () => {
    isColor = !isColor; // Toggle color mode
    asciiElement.classList.toggle('color-mode', isColor);
});

const helpDialog = document.getElementById('help-dialog');
document.getElementById('help-btn').addEventListener('click', () => {
    helpDialog.showModal();
});
document.getElementById('close-help-btn').addEventListener('click', () => {
    helpDialog.close();
});

startCamera();
