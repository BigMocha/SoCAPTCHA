document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const playButton = document.getElementById('playButton');
    const recordButton = document.getElementById('recordButton');
    const playbackButton = document.getElementById('playbackButton');
    const submitButton = document.getElementById('submitButton');
    const newBeatLink = document.getElementById('newBeat');
    const recordingStatus = document.getElementById('recordingStatus');
    const feedbackElement = document.getElementById('feedback');
    const audioVisualizer = document.getElementById('audioVisualizer');
    
    // Audio elements
    let audioContext;
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;
    let audioUrl;
    let audioElement;
    let isRecording = false;
    let recordingTimer;
    let seconds = 0;
    
    // Sample beat patterns (in a real app, these would be actual audio files)
    const beatPatterns = [
        { name: 'Simple 4/4', pattern: 'x.x...x...x...x...' },
        { name: 'Waltz', pattern: 'x..x..x..x..x..x..' },
        { name: 'Shuffle', pattern: 'x.x.x.x.x.x.x.x.x.' }
    ];
    
    let currentBeat = beatPatterns[0];
    
    // Initialize the app
    function init() {
        setupEventListeners();
        // In a real app, you would load the audio file here
        // loadBeat(currentBeat);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        playButton.addEventListener('click', playBeat);
        recordButton.addEventListener('click', toggleRecording);
        playbackButton.addEventListener('click', playRecording);
        submitButton.addEventListener('click', submitRecording);
        newBeatLink.addEventListener('click', loadNewBeat);
    }
    
    // Play the beat pattern
    function playBeat() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // In a real app, this would play an actual audio file
        // For now, we'll just simulate it with the visualizer
        simulateBeatPlayback();
        
        // Enable recording after the beat has been played
        recordButton.disabled = false;
    }
    
    // Simulate beat playback with the visualizer
    function simulateBeatPlayback() {
        const pattern = currentBeat.pattern;
        const visualizerBars = 20;
        let currentPosition = 0;
        
        // Clear visualizer
        audioVisualizer.innerHTML = '';
        
        // Create bars for the visualizer
        for (let i = 0; i < visualizerBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            audioVisualizer.appendChild(bar);
        }
        
        const bars = audioVisualizer.querySelectorAll('.visualizer-bar');
        const interval = 200; // ms per beat
        
        // Animate the visualizer
        const beatInterval = setInterval(() => {
            if (currentPosition >= pattern.length) {
                clearInterval(beatInterval);
                return;
            }
            
            if (pattern[currentPosition] === 'x') {
                // Animate all bars with a wave effect
                bars.forEach((bar, index) => {
                    const height = 20 + Math.random() * 40;
                    bar.style.height = `${height}%`;
                    bar.style.backgroundColor = `hsl(${200 + Math.random() * 160}, 70%, 60%)`;
                    
                    // Reset after animation
                    setTimeout(() => {
                        bar.style.height = '20%';
                        bar.style.backgroundColor = '#4a6bff';
                    }, 150);
                });
            }
            
            currentPosition++;
        }, interval);
        
        // Stop after the pattern completes
        setTimeout(() => {
            clearInterval(beatInterval);
            bars.forEach(bar => {
                bar.style.height = '20%';
                bar.style.backgroundColor = '#4a6bff';
            });
        }, pattern.length * interval);
    }
    
    // Toggle recording
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }
    
    // Start recording
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioUrl = URL.createObjectURL(audioBlob);
                
                // Enable playback and submit buttons
                playbackButton.disabled = false;
                submitButton.disabled = false;
                
                // Clean up
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Start recording
            mediaRecorder.start();
            isRecording = true;
            recordButton.innerHTML = '<span class="icon">⏹️</span><span class="text">Stop Recording</span>';
            recordingStatus.classList.add('recording');
            
            // Start timer
            startTimer();
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            showFeedback('Microphone access denied. Please allow microphone access to continue.', 'error');
        }
    }
    
    // Stop recording
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            recordButton.innerHTML = '<span class="icon">🎤</span><span class="text">Record Again</span>';
            recordingStatus.classList.remove('recording');
            
            // Stop timer
            stopTimer();
        }
    }
    
    // Play back the recorded audio
    function playRecording() {
        if (audioUrl) {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            
            audioElement = new Audio(audioUrl);
            audioElement.play();
        }
    }
    
    // Submit the recording for verification
    function submitRecording() {
        // In a real app, you would send the audioBlob to your server for verification
        // For now, we'll simulate a successful verification
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="icon">⏳</span><span class="text">Verifying...</span>';
        
        // Simulate API call
        setTimeout(() => {
            // Randomly pass or fail for demo purposes
            const isVerified = Math.random() > 0.3; // 70% success rate for demo
            
            if (isVerified) {
                showFeedback('Success! Your hum matches the beat.', 'success');
                // In a real app, you would proceed to the next step
            } else {
                showFeedback('The hum doesn\'t match. Please try again.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = '<span class="icon">✅</span><span class="text">Verify</span>';
            }
        }, 2000);
    }
    
    // Load a new beat
    function loadNewBeat(e) {
        e.preventDefault();
        
        // Get a random beat (excluding the current one)
        const availableBeats = beatPatterns.filter(beat => beat !== currentBeat);
        currentBeat = availableBeats[Math.floor(Math.random() * availableBeats.length)];
        
        // Reset the UI
        resetUI();
        
        // Show feedback
        showFeedback(`Loaded new beat: ${currentBeat.name}`, 'success');
    }
    
    // Reset the UI to its initial state
    function resetUI() {
        // Stop any ongoing recording
        if (isRecording) {
            stopRecording();
        }
        
        // Reset buttons
        recordButton.disabled = true;
        playbackButton.disabled = true;
        submitButton.disabled = true;
        
        // Reset recording status
        recordingStatus.classList.remove('recording');
        recordButton.innerHTML = '<span class="icon">🎤</span><span class="text">Record Your Hum</span>';
        
        // Clear any feedback
        feedbackElement.className = 'feedback';
        feedbackElement.textContent = '';
        
        // Reset timer
        stopTimer();
    }
    
    // Show feedback message
    function showFeedback(message, type) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (feedbackElement.textContent === message) {
                feedbackElement.className = 'feedback';
                feedbackElement.textContent = '';
            }
        }, 5000);
    }
    
    // Timer functions
    function startTimer() {
        seconds = 0;
        updateTimer();
        recordingTimer = setInterval(updateTimer, 1000);
    }
    
    function stopTimer() {
        clearInterval(recordingTimer);
        recordingStatus.querySelector('span').textContent = '00:00';
    }
    
    function updateTimer() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        recordingStatus.querySelector('span').textContent = 
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        seconds++;
    }
    
    // Initialize the app
    init();
});
