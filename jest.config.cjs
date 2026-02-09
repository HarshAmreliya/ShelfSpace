module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "./tsconfig.jest.json" }],
  },
  extensionsToTreatAsEsm: [".ts"],
};
