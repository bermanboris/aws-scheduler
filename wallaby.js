module.exports = function(wallaby) {
  return {
    files: ["src/**/*.js", "!src/**/__tests__/*.js"],
    tests: ["__tests__/*.test.js"],

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
