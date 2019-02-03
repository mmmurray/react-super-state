module.exports = {
  ...require('mmm-scripts/jest.config'),
  setupFilesAfterEnv: ['react-testing-library/cleanup-after-each'],
}
