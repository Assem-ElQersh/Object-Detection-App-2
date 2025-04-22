/**
 * Application constants and configuration
 */

// Supported model configurations
const MODELS = [
  {
    name: 'COCO-SSD',
    type: 'cocossd',
    description: 'Fast object detection with 80 object categories',
    threshold: 0.5,        // Confidence threshold
    maxDetections: 20,     // Maximum detections to return
    modelSize: 'lite_mobilenet_v2',     // Model size variant
    classes: [             // Classes that this model can detect
      'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
      'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 
      'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 
      'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 
      'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 
      'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 
      'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 
      'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 
      'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 
      'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 
      'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 
      'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 
      'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 
      'scissors', 'teddy bear', 'hair drier', 'toothbrush'
    ]
  },
  {
    name: 'BlazeFace',
    type: 'blazeface',
    description: 'Fast face detection optimized for mobile devices',
    threshold: 0.75,       // Confidence threshold
    maxFaces: 10,          // Maximum faces to detect
    classes: ['face']      // Only detects faces
  }
];

// Default application settings
const DEFAULT_SETTINGS = {
  modelType: 'cocossd',
  confidenceThreshold: 0.5,
  maxDetections: 20,
  enableWebcam: false,
  webcamResolution: 'medium',    // 'low', 'medium', 'high'
  showBoundingBoxes: true,
  showLabels: true,
  showConfidence: true,
  enableTracking: false,         // Enable object tracking across frames
  enableHeatmap: false,          // Enable detection heatmap
  enableDarkMode: false          // UI theme
};

// Webcam resolution options
const WEBCAM_RESOLUTIONS = {
  low: {
    width: 320,
    height: 240,
    label: 'Low (320×240)'
  },
  medium: {
    width: 640,
    height: 480,
    label: 'Medium (640×480)'
  },
  high: {
    width: 1280,
    height: 720,
    label: 'High (1280×720)'
  }
};

// File upload constraints
const FILE_UPLOAD_CONSTRAINTS = {
  maxSizeMB: 10,
  acceptedTypes: 'image/jpeg,image/png,image/gif,image/webp'
};

// Application theme colors
const THEME_COLORS = {
  primary: '#3B82F6',       // Blue
  secondary: '#6B7280',     // Gray
  success: '#10B981',       // Green
  danger: '#EF4444',        // Red
  warning: '#F59E0B',       // Yellow
  info: '#3B82F6',          // Blue
  light: '#F3F4F6',         // Light gray
  dark: '#1F2937'           // Dark gray
};

// Detection visualization settings
const VISUALIZATION_SETTINGS = {
  boundingBoxWidth: 3,
  fontFamily: 'Arial, sans-serif',
  fontSize: 16,
  labelPadding: 4,
  objectColors: [
    '#FF3B30', // Red
    '#4CD964', // Green
    '#007AFF', // Blue
    '#FF9500', // Orange
    '#5856D6', // Purple
    '#FF2D55', // Pink
    '#FFCC00', // Yellow
    '#34C759', // Mint
    '#5AC8FA', // Teal
    '#AF52DE'  // Lavender
  ]
};

// Performance optimization settings
const PERFORMANCE_SETTINGS = {
  processingIntervalMs: 100,     // Min time between video frame processing
  maxWebcamFPS: 30,              // Maximum webcam frames per second
  videoOptimizationEnabled: true // Enable video optimization
};

// Error messages
const ERROR_MESSAGES = {
  modelLoadError: 'Failed to load the detection model. Please try refreshing the page or selecting a different model.',
  webcamAccessError: 'Unable to access webcam. Please ensure you have granted permission to use the camera.',
  fileUploadError: 'Error uploading file. Please check the file format and size.',
  browserSupportError: 'Your browser does not fully support all required features. Please use a modern browser like Chrome, Firefox, or Edge.',
  detectionError: 'An error occurred during object detection. Please try again.'
};
