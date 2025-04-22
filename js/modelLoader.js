/**
 * Service for loading and managing machine learning models
 */

// Initialize tensorflow
tf.enableProdMode(); // Optimize for production environments

/**
 * Load a model based on the specified type
 * 
 * @param {string} modelType - Type of model to load ('cocossd', 'blazeface', etc.)
 * @param {Object} options - Optional configuration for model loading
 * @returns {Promise<Object>} - The loaded model
 */
async function loadModel(modelType, options = {}) {
  console.log(`Loading ${modelType} model...`);
  
  try {
    // Initialize TensorFlow.js
    await tf.ready();
    console.log('TensorFlow.js initialized');
    
    let model;
    
    switch (modelType) {
      case 'cocossd':
        // Load COCO-SSD model
        model = await cocoSsd.load({
          base: options.modelSize || 'lite_mobilenet_v2', // 'lite', 'mobilenet_v1', 'mobilenet_v2'
          ...options
        });
        console.log('COCO-SSD model loaded successfully');
        break;
        
      case 'blazeface':
        // Load BlazeFace model for face detection
        model = await blazeface.load({
          maxFaces: options.maxFaces || 10,
          ...options
        });
        console.log('BlazeFace model loaded successfully');
        break;
        
      case 'custom':
        // Load a custom model (if implemented)
        if (!options.modelUrl) {
          throw new Error('Model URL is required for custom models');
        }
        
        model = await tf.loadGraphModel(options.modelUrl);
        console.log('Custom model loaded successfully');
        break;
        
      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }
    
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error(`Failed to load ${modelType} model: ${error.message}`);
  }
}

/**
 * Get information about the model's capabilities
 * 
 * @param {Object} model - The loaded model
 * @param {string} modelType - Type of the model
 * @returns {Object} - Information about the model's capabilities
 */
function getModelInfo(model, modelType) {
  switch (modelType) {
    case 'cocossd':
      return {
        name: 'COCO-SSD',
        description: 'Single Shot MultiBox Detection using COCO dataset',
        numClasses: 80, // COCO has 80 classes
        inputSize: '300x300', // Typical input size
        speedRating: 'Medium',
        accuracyRating: 'Medium'
      };
      
    case 'blazeface':
      return {
        name: 'BlazeFace',
        description: 'Lightweight face detector optimized for mobile GPU inference',
        numClasses: 1, // Only detects faces
        inputSize: '128x128', // Typical input size
        speedRating: 'Fast',
        accuracyRating: 'Medium'
      };
      
    case 'custom':
      return {
        name: 'Custom Model',
        description: 'User-provided custom detection model',
        numClasses: 'Unknown',
        inputSize: 'Unknown',
        speedRating: 'Unknown',
        accuracyRating: 'Unknown'
      };
      
    default:
      return {
        name: 'Unknown Model',
        description: 'Model type not recognized',
        numClasses: 'Unknown',
        inputSize: 'Unknown',
        speedRating: 'Unknown',
        accuracyRating: 'Unknown'
      };
  }
}
