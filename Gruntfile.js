var config = require('orbs-grunt-config');

module.exports = function (grunt) {
  'use strict';

  // TODO: Look into grunt-mocha-test module. Code coverage, fail on coverage threshhold, etc.
  // https://www.npmjs.org/package/grunt-mocha-test

  // TODO: Allow orbs-grunt-config to manage loading grunt tasks
  // Currently, all grunt task dependencies must be listed in this project's package.json
  // and the contents must be passed to loadTasks
  config.loadTasks(grunt, require('./package.json'));
  config.initConfig(grunt);

  // TODO: Blanket support is wonky right now. The --blanket command line option is required
  // for files to be instrumented.
  //
  // This wonky hack was added because chrome debugging was always using instrumented code.
  // This allows blanket to be enabled only for certain commands, such as:
  //    grunt coverage --blanket
  //
  // Note that it can be used with other commands, but it doesn't make much sense. The last
  // one is interesting as you can step through the instrumented code in the chrome debugger.
  // Normally, these commands would not include --blanket.
  //    grunt test --blanket
  //    grunt debug test --blanket

  // Use blanket only if --blanket option is at end of grunt command line
  if (this.cli.options.blanket) {
    // Only files that match the pattern will be instrumented
    config.initBlanket(require('blanket'), '/orbs/lib/');
  }

  config.registerTasks(grunt);

};
