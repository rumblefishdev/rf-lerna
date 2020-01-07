/* global require module */
const cli = require("@lerna/cli")
const zipBundleCmd = require('./commands/zipbundle/command')
const pkg = require("./package.json")

module.exports = main

function main(argv) {
  const context = {
    lernaVersion: pkg.version
  }

  return cli()
    .command(zipBundleCmd)
    .parse(argv, context)
}
