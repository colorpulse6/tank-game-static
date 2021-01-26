const path = require('path');

module.exports = {
  entry: './dist/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    pathinfo: true
  },
  
  // watch: true 
};

//$ npx webpack --config webpack.config.js 