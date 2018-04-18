const babel = require('rollup-plugin-babel');

module.exports = {
  input: './src/index.js',
  output: {
    format: 'cjs',
    file: './lib/yarfl.js'
  },
  external: ['react'],
  plugins: [
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-rest-spread', 'transform-class-properties']
    })
  ]
};
