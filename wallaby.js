module.exports = function(wallaby) {
  return {
    files: ["src/**/*.js", "!src/**/__tests__/*.js"],

    tests: ["src/**/__tests__/*.test.js"],

    env: {
      type: "node",
      runner: "node"
    },

    testFramework: "jest",
    compilers: {
      "**/*.js": wallaby.compilers.babel()
    }
  };
};
