# Music Captcha System

A modern, interactive CAPTCHA system that uses audio patterns for verification. Users listen to a beat and then record themselves humming it back to verify they're human.

## Features

- 🎵 Play different beat patterns
- 🎤 Record your voice/humming
- 🔊 Playback your recording
- ✅ Submit for verification
- 📱 Responsive design that works on all devices

## How It Works

1. Click "Play Beat" to hear the pattern
2. Click "Record Your Hum" and hum the pattern back
3. Click "Stop Recording" when finished
4. Use "Play Recording" to review your recording
5. Click "Verify" to check if your hum matches the beat

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Web Audio API
- MediaRecorder API


### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/music-captcha.git
   ```
2. Navigate to the project directory:
   ```bash
   cd music-captcha
   ```
3. Open `index.html` in your web browser

## Usage

1. Open `index.html` in a web browser
2. Follow the on-screen instructions to complete the captcha
3. The system will verify if your humming matches the beat pattern

## Customization

You can easily customize the beat patterns in `script.js` by modifying the `beatPatterns` array. Each pattern is defined with a name and a simple string representation where 'x' represents a beat and '.' represents a rest.
