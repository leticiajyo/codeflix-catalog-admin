import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,

  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.interface.ts',
    '.fixture.ts',
    '.input.ts',
    '.d.ts',
    '-fake.builder.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',

  testRegex: '.*\\..*test\\.ts$',
  setupFilesAfterEnv: ['./core/shared/infra/testing/expect.helper.ts'],
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest',
  },
  testEnvironment: 'node',
};

export default config;
