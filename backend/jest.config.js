module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/__tests__/**",
    "!src/index.ts"
  ],
  coverageReporters: ["text", "lcov"],
  testTimeout: 30000,
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json"
    }
  }
};