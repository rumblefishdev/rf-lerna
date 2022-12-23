/* global module require */
"use strict"
const ValidationError = require("@lerna/validation-error");

module.exports.command = "zipbundle [packageName]"

module.exports.aliases = []

module.exports.describe = "Pack package and all the dependencies to a zip file"

module.exports.builder = yargs => {
  yargs.positional('packageName', {
    describe: 'package name to build',
    type: 'string'
  })
  yargs.options({
    target: {
      describe: 'zipfile target to build',
      type: 'string'
    },
    legacyPeer: {
      describe: 'restores peerDependency installation behavior from npm < 7',
    },
  })
  yargs.check(argv => {
    if (argv.target && ! argv.target.match(/.zip$/)) {
      throw new ValidationError('PARAMS', 'target should end with .zip')
    }
    return argv
  })
  return yargs
}

module.exports.handler = function handler(argv) {
  return require(".")(argv)
}
