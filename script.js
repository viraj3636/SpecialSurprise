// Elements
const landingPage = document.getElementById('landing-page');
const questionPage = document.getElementById('question-page');
const celebrationPage = document.getElementById('celebration-page');
const saveReactionPage = document.getElementById('save-reaction-page');

const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const bgMusic = document.getElementById('bg-music');
const musicControl = document.getElementById('music-control');

// Navigation functions
function showSection(section) {
    // Hide all currently active sections
    document.querySelectorAll('.screen.active').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');

        // Wait for transition to finish before setting display: none
        setTimeout(() => {
            el.style.display = 'none';
        }, 800);
    });

    // Show target section
    section.style.display = 'flex'; // Inline style overrides .hidden display:none
    // Force a reflow so the display change registers
    section.offsetHeight;
    section.classList.remove('hidden');
    section.classList.add('active');
}

// Envelope Interaction
const envelope = document.getElementById('envelope');
const openLetterBtn = document.getElementById('open-letter-btn');
const permissionModal = document.getElementById('permission-modal');
const allowRecordBtn = document.getElementById('allow-record-btn');
const denyRecordBtn = document.getElementById('deny-record-btn');

// Show permission modal on page load (before envelope interaction)
window.addEventListener('load', () => {
    permissionModal.classList.remove('hidden');
});

// Permission Handlers
allowRecordBtn.addEventListener('click', () => {
    startCamera();
    permissionModal.classList.add('hidden');
    playMusic();
});

denyRecordBtn.addEventListener('click', () => {
    // Just proceed without recording
    permissionModal.classList.add('hidden');
    playMusic();
});

// Music Logic
function playMusic() {
    bgMusic.volume = 0.5; // Set reasonable volume
    bgMusic.play().then(() => {
        musicControl.classList.add('playing');
        musicControl.innerText = "🎵 Music: On";
    }).catch(e => {
        console.log("Audio play failed (user interaction needed):", e);
    });
}

musicControl.addEventListener('click', () => {
    if (bgMusic.paused) {
        playMusic();
    } else {
        bgMusic.pause();
        musicControl.classList.remove('playing');
        musicControl.innerText = "🎵 Music: Off";
    }
});

envelope.addEventListener('click', () => {
    envelope.classList.add('open');
});

openLetterBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent toggling envelope
    // Try to play audio
    if (bgMusic.src) {
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
    }
    showSection(questionPage);
    // Camera started on envelope click
});

// Reactive GIFs
const gifElement = document.getElementById('question-gif');
const cuteGif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2QyZzZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4/l0HlCqVze6eFNE7jG/giphy.gif"; // Default Cute
const happyGif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2QyZzZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4/10Ueeml8D5fV0k/giphy.gif"; // Excited Bear (Generic placeholder)
const sadGif = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2QyZzZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4YjZ4/7SF5scGB2AFrgsXP63/giphy.gif"; // Crying Bear (Generic placeholder)

// Yes Hover
yesBtn.addEventListener('mouseover', () => {
    gifElement.src = happyGif;
});
yesBtn.addEventListener('mouseout', () => {
    gifElement.src = cuteGif;
});

// No Hover
noBtn.addEventListener('mouseover', () => {
    gifElement.src = sadGif;
    moveNoButton(); // Keep evasion logic
});
noBtn.addEventListener('mouseout', () => {
    gifElement.src = cuteGif;
});

// Camera / Video Recording Logic
let mediaRecorder;
let recordedChunks = [];

function getSupportedMimeType() {
    const types = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
        "video/mpeg"
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return "video/webm"; // Default fallback
}

let mimeType = getSupportedMimeType();
let reactionVideoUrl = null; // Store the video URL globally

async function startCamera() {
    // Prevent restarting if already active
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        console.log("Camera already recording.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user" // Selfie camera preference
            },
            audio: false
        });

        // Re-check mimeType just in case
        mimeType = getSupportedMimeType();
        console.log("Using MIME type:", mimeType);

        try {
            mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
        } catch (e) {
            console.warn("MimeType specific init failed, trying default.", e);
            mediaRecorder = new MediaRecorder(stream);
        }

        mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.start();
        document.getElementById('camera-message').classList.remove('hidden');
        console.log("Recording started...");
    } catch (err) {
        console.warn("Camera access denied or not available:", err);
        alert("Camera access needed for the surprise! Please check permissions.");
    }
}

function stopCamera() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            reactionVideoUrl = URL.createObjectURL(blob);
            const videoPreview = document.getElementById('reaction-video');
            const downloadLink = document.getElementById('download-video');

            videoPreview.src = reactionVideoUrl;

            // Set correct extension based on type
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            downloadLink.download = `hitiksha_reaction.${ext}`;
            downloadLink.href = reactionVideoUrl;

            console.log("Video saved. Ready to display.");

            // Stop all tracks to turn off camera light
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };
    }
}

// "Yes" Button Interaction -> End Recording
yesBtn.addEventListener('click', () => {
    fireConfetti();
    // stopCamera(); // DON'T stop here - keep recording!
    showSection(celebrationPage);
    startSlideshow();
});

function moveNoButton() {
    const container = document.body;
    const btnRect = noBtn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate max positions
    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;

    // Randomize
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Apply new position
    noBtn.style.position = 'fixed'; // Switch to fixed to move anywhere
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';

    // Change text slightly for fun
    const funTexts = ["No?", "Are you sure?", "Really?", "Think again!", "Missed me!", "Try again!"];
    noBtn.innerText = funTexts[Math.floor(Math.random() * funTexts.length)];
}

// Slideshow Logic
const slides = [
    { text: "You are my sunshine ☀️", img: "images/1.jpg" },
    { text: "Every moment with you is magic ✨", img: "images/IMG_9266 2.JPG" },
    { text: "I love your smile 😊", img: "images/IMG_9363 2.jpg" },
    { text: "My heart beats for you 💓", img: "images/IMG_9428 2.jpg" },
    { text: "Forever yours 💑", img: "images/IMG_9434 2.jpg" },
    { text: "You make life beautiful 🌸", img: "images/IMG_9443 2.jpg" },
    { text: "I'm so lucky to have you 🍀", img: "images/IMG_9534 2.JPG" },
    { text: "You complete me 🧩", img: "images/IMG_9647 2.jpg" }
];

function startSlideshow() {
    let index = 0;
    let cycles = 0;
    let slideshowInterval;
    const imgElement = document.getElementById('slideshow-img');
    const textElement = document.getElementById('slideshow-text');

    // Load first image immediately (no fade-out on first load)
    imgElement.src = slides[0].img;
    textElement.innerText = slides[0].text;
    imgElement.style.opacity = 1;
    textElement.style.opacity = 1;
    index = 1; // Start the interval from the second image

    // Set transitions after first image is shown
    imgElement.style.transition = "opacity 0.5s ease-in-out";
    textElement.style.transition = "opacity 0.5s ease-in-out";

    function updateSlide() {
        // Fade out
        imgElement.style.opacity = 0;
        textElement.style.opacity = 0;

        setTimeout(() => {
            // Change content
            imgElement.src = slides[index].img;
            textElement.innerText = slides[index].text;

            // Fade in
            imgElement.style.opacity = 1;
            textElement.style.opacity = 1;

            // Check if we completed a cycle
            if (index === slides.length - 1) {
                cycles++;
                if (cycles === 1) {
                    // Stop slideshow and show save reaction page
                    clearInterval(slideshowInterval);
                    stopCamera(); // Stop recording NOW (capture full reaction)
                    setTimeout(() => {
                        showSaveReactionPage();
                    }, 3000); // Wait 3 seconds on last slide before transitioning
                }
            }

            // Next index
            index = (index + 1) % slides.length;
        }, 500); // 500ms fade out
    }

    slideshowInterval = setInterval(updateSlide, 3000); // Change every 3 seconds
}

function showSaveReactionPage() {
    const videoContainer = document.getElementById('video-container');
    const noVideoMessage = document.getElementById('no-video-message');

    if (reactionVideoUrl) {
        // Video exists, show it
        videoContainer.classList.remove('hidden');
        if (noVideoMessage) noVideoMessage.classList.add('hidden');
    } else {
        // No video, show friendly message
        videoContainer.classList.add('hidden');
        if (noVideoMessage) noVideoMessage.classList.remove('hidden');
    }

    showSection(saveReactionPage);
}

// (Duplicate yesBtn listener removed - already handled above at line 186)

// Confetti Effect
function fireConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// Background Floating Hearts
function createFloatingHearts() {
    const container = document.querySelector('.background-elements');
    const heartCount = 15; // Number of hearts

    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        // Randomize position and animation
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5s
        heart.style.animationDelay = (Math.random() * 5) + 's';
        heart.style.opacity = Math.random() * 0.5 + 0.1; // 0.1-0.6
        heart.style.transform = `scale(${Math.random() * 0.5 + 0.5})`; // 0.5-1.0 size

        container.appendChild(heart);
    }
}

// Initialize
createFloatingHearts();
