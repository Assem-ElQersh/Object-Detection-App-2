// ResultsPanel.js - Component for displaying detection results
const { useState } = React;

function ResultsPanel({ predictions, modelConfig }) {
  const [sortBy, setSortBy] = useState('confidence'); // 'confidence' or 'name'
  const [filterText, setFilterText] = useState('');
  
  if (!predictions || predictions.length === 0) {
    return null;
  }
  
  // Filter predictions based on search text
  const filteredPredictions = predictions.filter(pred => 
    pred.class.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Sort predictions based on selected sort option
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortBy === 'confidence') {
      return b.score - a.score; // Highest confidence first
    } else {
      return a.class.localeCompare(b.class); // Alphabetical by class name
    }
  });
  
  // Count detections by class
  const classCounts = {};
  predictions.forEach(pred => {
    classCounts[pred.class] = (classCounts[pred.class] || 0) + 1;
  });
  
  // Get total number of unique classes detected
  const uniqueClassesCount = Object.keys(classCounts).length;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
      
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          {/* Detection summary */}
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-gray-600">
              Detected {predictions.length} object{predictions.length !== 1 ? 's' : ''} across {uniqueClassesCount} class{uniqueClassesCount !== 1 ? 'es' : ''}
            </p>
          </div>
          
          {/* Sort and filter controls */}
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter objects..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="confidence">Confidence</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* No results after filtering */}
      {sortedPredictions.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No objects match your filter.
        </p>
      )}
      
      {/* Results table */}
      {sortedPredictions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Object Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPredictions.map((prediction, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ 
                        backgroundColor: `hsl(${(prediction.class.length * 5) % 360}, 70%, 50%)` 
                      }}></div>
                      <span className="font-medium text-gray-900">{prediction.class}</span>
                      {classCounts[prediction.class] > 1 && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {classCounts[prediction.class]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.round(prediction.score * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900">{Math.round(prediction.score * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono">
                      x:{Math.round(prediction.bbox[0])}, y:{Math.round(prediction.bbox[1])}, 
                      w:{Math.round(prediction.bbox[2])}, h:{Math.round(prediction.bbox[3])}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Class distribution visualization */}
      {Object.keys(classCounts).length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Class Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(classCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([className, count]) => {
                const percentage = Math.round((count / predictions.length) * 100);
                return (
                  <div 
                    key={className}
                    className="bg-gray-100 rounded-lg px-3 py-1 text-sm flex items-center"
                    style={{ 
                      borderLeft: `4px solid hsl(${(className.length * 5) % 360}, 70%, 50%)` 
                    }}
                  >
                    <span className="font-medium mr-2">{className}</span>
                    <span className="text-gray-500">{count} ({percentage}%)</span>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
}
                