const babel = require('rollup-plugin-babel');

module.exports = {
  input: './src/index.jsx',
  output: [
    {
      format: 'cjs',
      file: './lib/yarfl.js'
    }
  ],
  plugins: [babel()]
};
