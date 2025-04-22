/**
 * Utility functions for drawing detection results on canvas
 */

/**
 * Draw detection boxes and labels on canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
 * @param {Array} detections - Array of detection results
 * @param {Object} modelConfig - Configuration for the specific model
 */
function drawDetections(ctx, detections, modelConfig) {
  if (!ctx || !detections || !Array.isArray(detections)) {
    return;
  }

  // Color palette for different classes
  const colorPalette = [
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
  ];

  const labelFontSize = 16;
  ctx.font = `${labelFontSize}px Arial`;
  ctx.lineWidth = 3;

  // Create a map for class colors to maintain consistency
  const classColorMap = new Map();
  let colorIndex = 0;

  detections.forEach(detection => {
    const { bbox, class: className, score } = detection;
    const [x, y, width, height] = bbox;
    
    // Ensure coordinates are within canvas
    if (x < 0 || y < 0 || x + width > ctx.canvas.width || y + height > ctx.canvas.height) {
      return; // Skip this detection if it's outside the canvas
    }

    // Assign a color for this class
    if (!classColorMap.has(className)) {
      classColorMap.set(className, colorPalette[colorIndex % colorPalette.length]);
      colorIndex++;
    }
    const color = classColorMap.get(className);

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();

    // Format label text
    const confidence = Math.round(score * 100);
    const label = `${className}: ${confidence}%`;
    const textMetrics = ctx.measureText(label);
    const textWidth = textMetrics.width;
    const padding = 4;

    // Draw label background
    ctx.fillStyle = color;
    ctx.fillRect(x, y - labelFontSize - padding * 2, textWidth + padding * 2, labelFontSize + padding * 2);
    
    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x + padding, y - padding);
  });
}

/**
 * Clear the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function clearCanvas(ctx) {
  if (ctx && ctx.canvas) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Draw a video frame on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {HTMLVideoElement} videoElement - The video element
 */
function drawVideoFrame(ctx, videoElement) {
  if (!ctx || !videoElement) {
    return;
  }
  
  ctx.drawImage(
    videoElement,
    0, 0,
    ctx.canvas.width,
    ctx.canvas.height
  );
}

/**
 * Draw tracking paths for objects
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} trackingPaths - Array of tracking paths
 * @param {Object} classColorMap - Map of class names to colors
 */
function drawTrackingPaths(ctx, trackingPaths, classColorMap) {
  if (!ctx || !trackingPaths || !Array.isArray(trackingPaths)) {
    return;
  }
  
  trackingPaths.forEach(path => {
    if (path.points.length < 2) {
      return;
    }
    
    const color = classColorMap.get(path.class) || '#FFFFFF';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    
    ctx.stroke();
  });
}

/**
 * Draw a heatmap of detections
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} detections - Array of detection results
 */
function drawDetectionHeatmap(ctx, detections) {
  if (!ctx || !detections || !Array.isArray(detections)) {
    return;
  }
  
  // Create an offscreen canvas for the heatmap
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = ctx.canvas.width;
  offscreenCanvas.height = ctx.canvas.height;
  const offCtx = offscreenCanvas.getContext('2d');
  
  // Clear the offscreen canvas
  offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  
  // Draw gaussian blobs for each detection
  detections.forEach(detection => {
    const { bbox, score } = detection;
    const [x, y, width, height] = bbox;
    
    // Calculate center of the bounding box
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Create a radial gradient
    const radius = Math.max(width, height) / 2;
    const gradient = offCtx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    
    // Color based on confidence score
    gradient.addColorStop(0, `rgba(255, 0, 0, ${score * 0.7})`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    // Draw the gradient
    offCtx.fillStyle = gradient;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    offCtx.fill();
  });
  
  // Composite the heatmap onto the main canvas
  ctx.globalAlpha = 0.6;
  ctx.drawImage(offscreenCanvas, 0, 0);
  ctx.globalAlpha = 1.0;
}