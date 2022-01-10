/* global require module */
const cli = require("@lerna/cli")
const zipBundleCmd = require('./commands/zipbundle/command')
const releaseCmd = require('./commands/release/command')
const pkg = require("./package.json")

module.exports = main

function main(argv) {
  const context = {
    lernaVersion: pkg.version
  }

  return cli()
    .command(zipBundleCmd)
    .command(releaseCmd)
    .parse(argv, context)
}
