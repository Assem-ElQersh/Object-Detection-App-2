// DetectionView.js - Component for displaying detection results
const { useRef, useEffect, useState } = React;

function DetectionView({
  model,
  image,
  useWebcam,
  isDetecting,
  onDetectionResults,
  onDetectionStart,
  modelConfig
}) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [videoStream, setVideoStream] = useState(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const requestRef = useRef(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [webcamError, setWebcamError] = useState(null);
  const isMounted = useRef(true);

  // Set up isMounted ref for cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      setCanvasContext(ctx);
      setCanvasInitialized(true);
      console.log("Canvas initialized", ctx);
    }
  }, [canvasRef]);

  // Handle image detection
  useEffect(() => {
    let isActive = true; // For handling async operations

    if (image && model && canvasInitialized && !useWebcam) {
      const detectImage = async () => {
        try {
          console.log("Starting image detection");
          if (!isActive) return;
          onDetectionStart();
          
          // Set canvas dimensions to match image
          canvasRef.current.width = image.width;
          canvasRef.current.height = image.height;
          
          // Clear previous results
          canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw the image first
          canvasContext.drawImage(image, 0, 0, image.width, image.height);
          
          // Detect objects - add a timeout to allow UI to update
          setTimeout(async () => {
            if (!isActive) return;
            
            try {
              console.log("Running detection on image");
              const results = await detectObjects(model, imageRef.current, modelConfig);
              console.log("Detection results:", results);
              
              if (!isActive) return;
              
              // Draw detection boxes
              drawDetections(canvasContext, results, modelConfig);
              
              // Send results to parent component
              onDetectionResults(results);
            } catch (error) {
              console.error("Error in detection:", error);
              if (isActive) {
                onDetectionResults([]);
              }
            }
          }, 100);
          
        } catch (err) {
          console.error('Error during image detection:', err);
          if (isActive) {
            onDetectionResults([]);
          }
        }
      };
      
      detectImage();
    }
    
    return () => {
      isActive = false;
    };
  }, [image, model, canvasInitialized, useWebcam, onDetectionStart, onDetectionResults, canvasContext, modelConfig]);

  // Start/stop webcam
  useEffect(() => {
    let mounted = true;
    
    const startWebcam = async () => {
      try {
        setWebcamError(null);
        console.log("Attempting to start webcam");
        
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment'
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Webcam stream obtained:", stream);
        
        if (!mounted) {
          // Cleanup if component unmounted during async operation
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setVideoStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            if (!mounted) return;
            
            console.log("Video metadata loaded:", videoRef.current.videoWidth, videoRef.current.videoHeight);
            setVideoDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
            
            // Also update canvas dimensions
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              
              // Initial draw to show the video
              if (canvasContext) {
                canvasContext.drawImage(
                  videoRef.current, 
                  0, 0, 
                  canvasRef.current.width, 
                  canvasRef.current.height
                );
              }
            }
          };
          
          // Explicitly start playing
          videoRef.current.play().catch(e => {
            console.error("Error playing video:", e);
            setWebcamError("Could not play video: " + e.message);
          });
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        if (mounted) {
          setWebcamError(`Webcam error: ${err.message || 'Could not access camera'}`);
        }
      }
    };

    const stopWebcam = () => {
      console.log("Stopping webcam");
      if (videoStream) {
        videoStream.getTracks().forEach(track => {
          console.log("Stopping track:", track);
          track.stop();
        });
        setVideoStream(null);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    if (useWebcam && !videoStream) {
      startWebcam();
    } else if (!useWebcam && videoStream) {
      stopWebcam();
    }

    return () => {
      mounted = false;
      stopWebcam();
    };
  }, [useWebcam, canvasContext]);

  // Webcam detection loop
  useEffect(() => {
    let isActive = true;
    
    const detectFrame = async () => {
      if (!isActive) return;
      
      if (
        videoRef.current && 
        model && 
        canvasContext && 
        videoRef.current.readyState === 4 && // HAVE_ENOUGH_DATA
        videoRef.current.videoWidth > 0
      ) {
        try {
          // Draw the current video frame
          canvasContext.drawImage(
            videoRef.current, 
            0, 0, 
            canvasRef.current.width, 
            canvasRef.current.height
          );
          
          // Detect objects in the current frame
          const results = await detectObjects(model, videoRef.current, modelConfig);
          
          if (!isActive) return;
          
          // Draw detection boxes
          drawDetections(canvasContext, results, modelConfig);
          
          // Send results to parent component (throttled)
          onDetectionResults(results);
        } catch (err) {
          console.error('Error during webcam detection:', err);
        }
      } else {
        console.log("Not ready for detection:", {
          videoReady: videoRef.current?.readyState === 4,
          modelReady: !!model,
          contextReady: !!canvasContext,
          videoWidth: videoRef.current?.videoWidth
        });
      }
      
      // Continue the detection loop
      if (isActive) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    };

    // Only start detection if all required pieces are available
    if (useWebcam && model && videoStream && canvasInitialized && videoRef.current) {
      console.log("Starting webcam detection loop");
      requestRef.current = requestAnimationFrame(detectFrame);
    }

    return () => {
      isActive = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [useWebcam, model, videoStream, canvasInitialized, canvasContext, onDetectionResults, modelConfig]);

  // Debug logging for video element
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleVideoEvent = (event) => {
        console.log(`Video event: ${event.type}`);
      };
      
      // Listen for various video events for debugging
      video.addEventListener('play', handleVideoEvent);
      video.addEventListener('playing', handleVideoEvent);
      video.addEventListener('pause', handleVideoEvent);
      video.addEventListener('waiting', handleVideoEvent);
      video.addEventListener('error', (e) => console.error('Video error:', e));
      
      return () => {
        video.removeEventListener('play', handleVideoEvent);
        video.removeEventListener('playing', handleVideoEvent);
        video.removeEventListener('pause', handleVideoEvent);
        video.removeEventListener('waiting', handleVideoEvent);
        video.removeEventListener('error', handleVideoEvent);
      };
    }
  }, [videoRef.current]);

  return (
    <div className="relative flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
      {/* Hidden image for detection processing */}
      {image && !useWebcam && (
        <img
          ref={imageRef}
          src={image.src}
          alt="Detection source"
          className="hidden"
          crossOrigin="anonymous"
        />
      )}
      
      {/* Video element for webcam */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={useWebcam ? "absolute inset-0 opacity-0" : "hidden"}
      />
      
      {/* Canvas for drawing detection results */}
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-[70vh] object-contain"
        width={videoDimensions.width}
        height={videoDimensions.height}
      />
      
      {/* Placeholder when no image or webcam */}
      {!image && !useWebcam && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-lg">
            Upload an image or enable webcam to start detection
          </p>
        </div>
      )}
      
      {/* Webcam error message */}
      {useWebcam && webcamError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium">{webcamError}</p>
            <p className="text-gray-600 mt-2">Please ensure your camera is connected and you've granted permission to use it.</p>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {isDetecting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Detecting objects...</p>
          </div>
        </div>
      )}
    </div>
  );
}