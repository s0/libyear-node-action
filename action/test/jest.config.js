module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts'
  ],
};