module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { diagnostics: false }],
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.d.ts',
    '!**/index.ts',
    '!main.ts',
    '!app.module.ts',
    '!**/*.module.ts',
    '!**/*.config.ts',
    '!**/constants/**',
    '!infrastructure/config/**',
    '!infrastructure/logging/**',
    '!core/middleware/**',
    '!infrastructure/adapters/**',
    '!**/dto/**',
    '!**/types/**',
    '!**/interfaces/**',
    '!**/testing/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!uuid/)'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
  },
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'cobertura'
  ],
};
