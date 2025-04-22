// ImageUploader.js - Component for uploading images
const { useRef, useState } = React;

function ImageUploader({ onImageUpload, disabled }) {
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Check file type
    const validTypes = FILE_UPLOAD_CONSTRAINTS.acceptedTypes.split(',').map(type => type.trim());
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      fileInputRef.current.value = '';
      return;
    }
    
    // Check file size
    const maxSizeBytes = FILE_UPLOAD_CONSTRAINTS.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image size should be less than ${FILE_UPLOAD_CONSTRAINTS.maxSizeMB}MB`);
      fileInputRef.current.value = '';
      return;
    }
    
    // Clear previous errors
    setError(null);
    setIsLoading(true);
    
    // Create image object
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("File loaded to data URL");
      const img = new Image();
      
      img.onload = () => {
        console.log("Image loaded successfully:", img.width, "x", img.height);
        setIsLoading(false);
        onImageUpload(img);
      };
      
      img.onerror = (err) => {
        console.error("Image loading error:", err);
        setError('Failed to load image. Please try another file.');
        setIsLoading(false);
      };
      
      // Set crossOrigin to avoid tainted canvas issues
      img.crossOrigin = "anonymous";
      img.src = event.target.result;
    };
    
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      setError('Failed to read the image file.');
      setIsLoading(false);
    };
    
    console.log("Reading file as data URL");
    reader.readAsDataURL(file);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        accept={FILE_UPLOAD_CONSTRAINTS.acceptedTypes}
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={disabled || isLoading}
      />
      
      {/* Upload button */}
      <button
        onClick={handleUploadClick}
        className={`px-4 py-2 rounded font-medium ${
          disabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          'Upload Image'
        )}
      </button>
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}