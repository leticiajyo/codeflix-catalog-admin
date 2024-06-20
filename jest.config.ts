import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,

  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageProvider: 'v8',

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
