# Happy Lunar New Year Fireworks

A beautiful, interactive fireworks display built with HTML5 Canvas and JavaScript to celebrate the Lunar New Year!

## Features

- **Multiple Firework Shapes**: Circle, rectangle, star, flower, heart, spiral, infinity, and custom text
- **Text Fireworks**: Displays messages like , "HAPPY", "NEW YEAR", and more
- **Starry Night Sky**: Animated background with twinkling stars and shooting meteors
- **Sound Effects**: Explosion sounds with spatial audio
- **Performance Optimized**: 
  - Memory management with particle caps
  - Delta time for consistent animation across devices
  - Mobile-responsive design
  - Efficient audio node cleanup
- **User Controls**:
  - Start/Stop fireworks
  - Toggle sound on/off
  - Adjustable firework frequency (Slow, Medium, Fast, Very Fast)
- **Fully Responsive**: Works beautifully on desktop, tablet, and mobile devices

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

### File Structure

```
.
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Core JavaScript logic
├── sound_effect.mp4    # Explosion sound effect 
└── readme.md           # How to use
```
## Quick Start
Follow the link **[https://tanh221.github.io](https://tanh221.github.io)** and click "Start Fireworks"!
## How to Use

1. **Start the Show**: Click the "Start Fireworks" button on the welcome screen
2. **Control Playback**: Use the "⏸ Stop" / "▶ Start" button to pause/resume
3. **Adjust Sound**: Click "🔊 Sound" / "🔇 Muted" to toggle audio
4. **Change Speed**: Select from the dropdown: Slow, Medium, Fast, or Very Fast

## Technical Details

### Technologies Used

- **HTML5 Canvas**: For rendering graphics
- **Vanilla JavaScript**: No dependencies or frameworks
- **CSS3**: Modern styling with flexbox and gradients
- **Web Audio API**: For sound playback

### Key Features Implementation

- **Delta Time Animation**: Ensures smooth animation regardless of frame rate
- **Memory Management**: Automatically removes old particles when limit is reached
- **Audio Pooling**: Limits concurrent sounds and cleans up audio nodes
- **Text Rendering**: Converts text to particle coordinates using canvas pixel sampling
- **Responsive Design**: Media queries adapt UI for different screen sizes

##  Credits

Created by Tanh for the Lunar New Year celebration (last updated: January 2026)


# Happy Lunar New Year!
