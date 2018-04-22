const base = require('./jest.config.base.json');

module.exports = Object.assign(base, {
  coverageReporters: ['text']
});
