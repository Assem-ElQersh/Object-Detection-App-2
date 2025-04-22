// ModelSelector.js - Component for selecting detection models
function ModelSelector({ models, selectedModel, onModelChange, disabled }) {
  const handleChange = (e) => {
    onModelChange(e.target.value);
  };
  
  return (
    <div className="flex flex-col">
      <label htmlFor="model-selector" className="text-sm font-medium text-gray-700 mb-1">
        Detection Model
      </label>
      <div className="relative">
        <select
          id="model-selector"
          value={selectedModel}
          onChange={handleChange}
          disabled={disabled}
          className={`
            appearance-none rounded-md block w-full px-3 py-2 border border-gray-300
            shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
          `}
        >
          {models.map((model) => (
            <option key={model.type} value={model.type}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {selectedModel && (
        <div className="mt-1 text-xs text-gray-500">
          {models.find(m => m.type === selectedModel)?.description}
        </div>
      )}
    </div>
  );
}
