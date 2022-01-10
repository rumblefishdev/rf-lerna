/* global require module */

const Command = require("@lerna/command");
const inquirer = require('inquirer');
const execSync = require('child_process').execSync;

module.exports = factory;

function factory(argv) {
  return new ReleaseCommand(argv);
}

class ReleaseCommand extends Command {
  async initialize() {}

  async execute() {
    inquirer
      .prompt({
        type: 'list',
        name: 'package',
        message: "Select package to bump version",
        choices: () => {
          const output = execSync(`lerna list -a --json`, { encoding: 'utf-8' });
          const packages = JSON.parse(output)
          return packages.map((pckg) => pckg.name)
        },
      })
      .then(async (answer) => {
        const packageName = answer.package 
        // export token part:
        const npmrc = execSync(
          `cat ~/.npmrc `,
          { encoding: 'utf-8' },
        );
        const token = npmrc.slice(npmrc.indexOf('ghp_'), npmrc.indexOf('ghp_') + 40);
        if(!token) {
          inquirer.prompt({
            type: 'input',
            name: 'token',
            message: "Provide your github access token",
          }).then((tkn) => {
            process.env.GH_TOKEN = tkn.token;
          })
        }else{
          process.env.GH_TOKEN = token;
        }

        // check version
        const version = execSync(
          `lerna list -a --scope=${packageName} --ndjson`,
          { encoding: 'utf-8' },
        );
        const packageInfo = JSON.parse(version)
        if(packageInfo['version'].includes('alpha')) {
          // prompt prerelease
          inquirer.prompt({
            type: 'list',
            name: 'release',
            message: "Do you want to graduate a package or bump to a release version?",
            choices: ['pre-release', 'release'],
          }).then((ver) => {
            if(ver['release'] === 'pre-release') {
              execSync(`lerna version  --force-publish=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
            } else {
              execSync(`lerna version  --force-publish=${packageName} --conventional-graduate=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
            }
          })
        } else {
          // prompt release
          inquirer.prompt({
            type: 'list',
            name: 'release',
            message: "Do you want to release next version or change to a prerelease version?",
            choices: ['pre-release', 'release'],
          }).then((ver) => {
            if(ver['release'] === 'pre-release') {
              console.log('dupa')
              execSync(`lerna version  --force-publish=${packageName} --conventional-prerelease=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
            } else {
              execSync(`lerna version  --force-publish=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
            }
          })
        }
      });
  }
}

module.exports.ReleaseCommand = ReleaseCommand;
