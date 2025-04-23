# Real-Time Object Detection Application (CDN Version)

This is a modified version of my original [Object Detection App](https://github.com/Assem-ElQersh/Object-Detection-App) that uses CDN-based dependencies instead of npm packages. This approach helps avoid dependency conflicts that can occur with npm installations.

## Key Changes

### Architecture Change: NPM → CDN
- Removed npm package dependencies in favor of loading libraries via CDN
- Eliminated the need for Node.js, npm, and package.json
- Static HTML/JS application that works directly in the browser without build steps

### Implementation Details

1. **Dependency Management**:
   - TensorFlow.js, COCO-SSD, and BlazeFace models loaded from CDN
   - React and ReactDOM loaded from CDN
   - Tailwind CSS loaded from CDN using their in-browser build system

2. **Structure**:
   - Single HTML file loads all dependencies and scripts
   - JavaScript files are organized in a modular structure
   - React components defined in separate files using Babel for JSX transformation

3. **File Organization**:
   ```
   object-detection-app/
   ├── index.html               # Main HTML file with CDN imports
   ├── js/                      # JavaScript files
   │   ├── constants.js         # Application constants
   │   ├── detectionService.js  # Object detection logic
   │   ├── drawingUtils.js      # Canvas drawing utilities
   │   ├── modelLoader.js       # Model loading utilities
   │   ├── index.js             # Application initialization
   │   ├── components/          # React components
   │       ├── App.js           # Main App component
   │       ├── DetectionView.js # Detection visualization component
   │       ├── ImageUploader.js # Image upload component
   │       ├── ModelSelector.js # Model selection component
   │       └── ResultsPanel.js  # Detection results display component
   ```

## Features

All existing features from the original application have been preserved:

- 📷 Image upload and object detection
- 🎥 Real-time webcam object detection
- 🔍 Support for multiple pre-trained models (COCO-SSD, BlazeFace)
- 📊 Detection results visualization with bounding boxes
- 📱 Responsive design for desktop and mobile devices

## Benefits of This Approach

1. **No Build Process Required**: The application can be run directly in a browser without npm install or build steps
2. **Reduced Dependencies**: Eliminates local node_modules and dependency conflicts
3. **Easy Deployment**: Can be deployed on any static file hosting service
4. **Simplified Development**: No need for a Node.js environment to develop or run the application

## Getting Started

Simply open the `index.html` file in a modern web browser to run the application. No server or installation required!

## Browser Support

This application requires a modern browser with support for:

- ES6+ JavaScript
- WebGL (for TensorFlow.js)
- WebRTC (for webcam access)
- Canvas API

## Performance Considerations

When using CDN-based dependencies:
- Initial load may be slower than optimized bundled applications
- TensorFlow.js model files are loaded over the network rather than bundled
- Consider adding CDN caching headers when deploying to production

## License

This project is licensed under the MIT License - see the [original repository](https://github.com/Assem-ElQersh/Object-Detection-App) for details.
