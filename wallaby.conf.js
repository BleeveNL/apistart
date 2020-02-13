module.exports = function(wallaby) {
  return {
    debug: true,
    env: {
      NODE_ENV: 'testing',
      type: 'node',
    },
    files: ['./package.json', './src/**/*.ts', './src/*.ts', '!./src/**/*.test.ts'],
    filesWithNoCoverageCalculated: ['src/tests/**/*.ts', './src/tests/*.ts'],
    tests: ['./src/**/*.test.ts'],
    localProjectDir: __dirname,
    setup: function(wallaby) {
      var mocha = wallaby.testFramework
      mocha.ui('tdd')
    },
    testFramework: 'mocha',
  }
}

// module.exports = function() {
//   return {
//     debug: true,
//     env: {
//       NODE_ENV: 'testing',
//       type: 'node',
//     },
//     files: [
//       './package.json',
//       {instrument: true, pattern: 'src/**/**.ts'},
//       {ignore: true, pattern: 'src/tests/**/*.test.ts'},
//       {ignore: true, pattern: 'src/tests/*.test.ts'},
//     ],
//     filesWithNoCoverageCalculated: ['src/tests/**/**.ts'],
//     localProjectDir: __dirname,
//     setup: function(wallaby) {
//       var mocha = wallaby.testFramework
//       mocha.ui('tdd')
//     },
//     testFramework: 'mocha',
//     tests: ['src/tests/*.test.ts', 'src/tests/**/*.test.ts'],
//   }
// }
