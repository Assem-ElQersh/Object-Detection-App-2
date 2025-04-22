// Initialize TensorFlow.js
tf.setBackend('webgl').then(() => {
  console.log('TensorFlow.js initialized with WebGL backend');
}).catch(err => {
  console.warn('WebGL backend not available, falling back to CPU:', err);
  tf.setBackend('cpu');
});

// Render the main App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(App, null)
);
