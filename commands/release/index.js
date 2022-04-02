/* global require module */

const Command = require("@lerna/command");
const inquirer = require('inquirer');
const execSync = require('child_process').execSync;

module.exports = factory;

function factory(argv) {
  return new ReleaseCommand(argv);
}

class ReleaseCommand extends Command {
  regex = /^ghp_[A-Za-z0-9]{36}$/

  async initialize() {}

  async execute() {
    return inquirer
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
      // check version and name
      const packageName = answer.package 
      const versionOutput = execSync(
        `lerna list -a --scope=${packageName} --ndjson`,
        { encoding: 'utf-8' },
      );
      const packageInfo = JSON.parse(versionOutput)
      const version = packageInfo.version
      // export token part:
      let token;
      try {
        const npmrc = execSync(
          `cat ~/.npmrc`,
          { encoding: 'utf-8' },
          );
        token = npmrc.slice(npmrc.indexOf('ghp_'), npmrc.indexOf('ghp_') + 40);
        if(!token || !this.regex.test(token)) {
          throw error();
        }
        process.env.GH_TOKEN = token;
        this.bumpVersion(packageName, version);
      } catch {
        const noToken = 'you do not have a .npmrc file or it does not contain a token';
        const wrongFormat = 'token format is not valid'
        const message = token.length === 0 ?  noToken : wrongFormat;
        console.log('\x1b[42m%s\x1b[0m', message)
        inquirer.prompt({
          type: 'input',
          name: 'token',
          message: "Provide your github access token",
          validate: (input) => this.regex.test(input) ? true : 'provided token is invalid'
        }).then((tkn) => {
          process.env.GH_TOKEN = tkn.token;
          this.bumpVersion(packageName, version);
        })
      }
    });
  }

  bumpVersion(packageName, version) {
    if(version.includes('alpha')) {
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
      }).catch((error) => this.logError(error))
    } else {
      // prompt release
      inquirer.prompt({
        type: 'list',
        name: 'release',
        message: "Do you want to release next version or change to a prerelease version?",
        choices: ['pre-release', 'release'],
      }).then((ver) => {
        if(ver['release'] === 'pre-release') {
          execSync(`lerna version  --force-publish=${packageName} --conventional-prerelease=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
        } else {
          execSync(`lerna version  --force-publish=${packageName} --create-release github --ignore-changes '*'`, {stdio: 'inherit'});
        }
      }).catch((error) => this.logError(error))
    }
  }

  logError(error) {
    console.log('\x1b[45m%s\x1b[0m', 'lerna error:')
    console.log(error)
    console.log("sdterr",error.stderr.toString())
  }
}

module.exports.ReleaseCommand = ReleaseCommand;
