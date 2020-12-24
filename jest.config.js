const { defaults } = require('jest-config');

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
};
