// App.js - Main application component
const { useState, useEffect, useRef } = React;

function App() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [model, setModel] = useState(null);
  const modelRef = useRef(null); // Ref to track current model
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [useWebcam, setUseWebcam] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  // Update ref when model changes
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Load model on component mount or model change
  useEffect(() => {
    async function initializeModel() {
      try {
        setIsModelLoading(true);
        setError(null);
        
        // Dispose previous model if exists
        if (modelRef.current) {
          modelRef.current.dispose();
          setModel(null);
        }

        const loadedModel = await loadModel(selectedModel.type);
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error('Error loading model:', err);
        setError(`Failed to load ${selectedModel.name} model. Please try another model or refresh the page.`);
        setIsModelLoading(false);
      }
    }

    initializeModel();

    // Cleanup function
    return () => {
      // Dispose model when component unmounts or model changes
      if (modelRef.current) {
        modelRef.current.dispose();
        setModel(null);
      }
    };
  }, [selectedModel]);

  const handleModelChange = (modelType) => {
    const newModel = MODELS.find(m => m.type === modelType);
    if (newModel) {
      setSelectedModel(newModel);
      // Reset state when model changes
      setPredictions([]);
      setImage(null);
    }
  };

  const handleImageUpload = (imageData) => {
    if (useWebcam) {
      setUseWebcam(false);
    }
    setImage(imageData);
    setPredictions([]);
  };

  const toggleWebcam = () => {
    setUseWebcam(!useWebcam);
    if (image) {
      setImage(null);
    }
    setPredictions([]);
  };

  const handleDetectionResults = (results) => {
    setPredictions(results);
    setIsDetecting(false);
  };

  const startDetection = () => {
    setIsDetecting(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Object Detection App</h1>
        <p className="text-gray-600">Detect objects in images and webcam using AI models</p>
      </header>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <ModelSelector 
            models={MODELS} 
            selectedModel={selectedModel.type} 
            onModelChange={handleModelChange} 
            disabled={isModelLoading || isDetecting}
          />
          
          <div className="flex mt-4 md:mt-0 space-x-4">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              disabled={isModelLoading || isDetecting || useWebcam} 
            />
            
            <button
              onClick={toggleWebcam}
              className={`px-4 py-2 rounded font-medium ${
                useWebcam 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={isModelLoading || isDetecting}
            >
              {useWebcam ? 'Disable Webcam' : 'Enable Webcam'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {isModelLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Loading {selectedModel.name} model...</p>
          </div>
        ) : (
          <DetectionView
            model={model}
            image={image}
            useWebcam={useWebcam}
            isDetecting={isDetecting}
            onDetectionResults={handleDetectionResults}
            onDetectionStart={startDetection}
            modelConfig={selectedModel}
          />
        )}
      </div>

      {predictions.length > 0 && (
        <ResultsPanel predictions={predictions} modelConfig={selectedModel} />
      )}
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Powered by TensorFlow.js and {selectedModel.name}</p>
      </footer>
    </div>
  );
}
