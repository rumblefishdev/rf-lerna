/* global module require */
"use strict"

module.exports.command = "release"

module.exports.describe = "release package"

module.exports.handler = function handler(argv) {
  return require(".")(argv)
}
