/**
 * Service for handling object detection operations
 */

/**
 * Detect objects in an image or video frame
 * 
 * @param {Object} model - The loaded detection model (COCO-SSD, YOLO, etc.)
 * @param {HTMLElement} imageElement - The image or video element to detect objects in
 * @param {Object} modelConfig - Configuration for the specific model being used
 * @returns {Promise<Array>} - Array of detection results
 */
async function detectObjects(model, imageElement, modelConfig) {
  if (!model || !imageElement) {
    console.log("Missing model or image element", {model, imageElement});
    return [];
  }

  try {
    let predictions;
    console.log(`Running detection with ${modelConfig.type} model`);

    // Different detection approach based on model type
    switch (modelConfig.type) {
      case 'cocossd':
        // COCO-SSD detection
        predictions = await model.detect(imageElement, {
          scoreThreshold: modelConfig.threshold || 0.5,
          maxDetections: modelConfig.maxDetections || 20,
        });
        console.log("COCO-SSD detection results:", predictions);
        return predictions.map(prediction => ({
          bbox: prediction.bbox, // [x, y, width, height]
          class: prediction.class,
          score: prediction.score,
        }));

      case 'blazeface':
        // Blazeface detection
        console.log("Running BlazeFace detection");
        predictions = await model.estimateFaces(imageElement, false);
        console.log("BlazeFace detection results:", predictions);
        
        return predictions.map(prediction => {
          // Convert Blazeface format to standardized format
          const topLeft = prediction.topLeft.arraySync();
          const bottomRight = prediction.bottomRight.arraySync();
          const width = bottomRight[0] - topLeft[0];
          const height = bottomRight[1] - topLeft[1];
          
          return {
            bbox: [topLeft[0], topLeft[1], width, height],
            class: 'face',
            score: prediction.probability[0],
          };
        });

      case 'custom':
        // Custom model handling
        // Implement according to specific custom model requirements
        console.warn('Custom model detection not fully implemented');
        return [];

      default:
        console.error('Unknown model type:', modelConfig.type);
        return [];
    }
  } catch (error) {
    console.error('Error during object detection:', error);
    return [];
  }
}

/**
 * Filter detection results based on confidence threshold and classes
 * 
 * @param {Array} results - Detection results from the model
 * @param {number} confidenceThreshold - Minimum confidence score to include (0-1)
 * @param {Array} classFilter - Array of class names to include (empty for all)
 * @returns {Array} - Filtered detection results
 */
function filterDetections(results, confidenceThreshold, classFilter = []) {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results.filter(detection => {
    // Filter by confidence threshold
    if (detection.score < confidenceThreshold) {
      return false;
    }

    // Filter by class if specified
    if (classFilter.length > 0) {
      return classFilter.includes(detection.class);
    }

    return true;
  });
}

/**
 * Calculate intersection-over-union (IoU) for two bounding boxes
 * Used for non-maximum suppression
 * 
 * @param {Array} box1 - First bounding box [x, y, width, height]
 * @param {Array} box2 - Second bounding box [x, y, width, height]
 * @returns {number} - IoU score (0-1)
 */
function calculateIoU(box1, box2) {
  // Convert from [x, y, width, height] to [x1, y1, x2, y2]
  const box1Area = box1[2] * box1[3];
  const box2Area = box2[2] * box2[3];
  
  const box1X2 = box1[0] + box1[2];
  const box1Y2 = box1[1] + box1[3];
  const box2X2 = box2[0] + box2[2];
  const box2Y2 = box2[1] + box2[3];
  
  // Calculate intersection
  const intersectionX1 = Math.max(box1[0], box2[0]);
  const intersectionY1 = Math.max(box1[1], box2[1]);
  const intersectionX2 = Math.min(box1X2, box2X2);
  const intersectionY2 = Math.min(box1Y2, box2Y2);
  
  const intersectionWidth = Math.max(0, intersectionX2 - intersectionX1);
  const intersectionHeight = Math.max(0, intersectionY2 - intersectionY1);
  const intersectionArea = intersectionWidth * intersectionHeight;
  
  // Calculate union
  const unionArea = box1Area + box2Area - intersectionArea;
  
  // Calculate IoU
  return unionArea > 0 ? intersectionArea / unionArea : 0;
}

/**
 * Apply non-maximum suppression to detection results
 * Used to remove duplicate detections
 * 
 * @param {Array} detections - Array of detection results
 * @param {number} iouThreshold - IoU threshold for considering detections as duplicates
 * @returns {Array} - Filtered detection results after NMS
 */
function applyNonMaxSuppression(detections, iouThreshold = 0.5) {
  if (!detections || detections.length === 0) {
    return [];
  }
  
  // Sort detections by confidence score (highest first)
  const sortedDetections = [...detections].sort((a, b) => b.score - a.score);
  const selectedDetections = [];
  
  while (sortedDetections.length > 0) {
    // Take the detection with highest confidence
    const currentDetection = sortedDetections.shift();
    selectedDetections.push(currentDetection);
    
    // Filter remaining detections
    for (let i = sortedDetections.length - 1; i >= 0; i--) {
      const detection = sortedDetections[i];
      
      // Check if same class and high IoU
      if (
        detection.class === currentDetection.class &&
        calculateIoU(detection.bbox, currentDetection.bbox) > iouThreshold
      ) {
        // Remove this detection (duplicate)
        sortedDetections.splice(i, 1);
      }
    }
  }
  
  return selectedDetections;
}