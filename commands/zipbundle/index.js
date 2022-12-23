/* global require module */

const util = require("util");
const path = require('path');
const log = require("npmlog");
const { Command } = require("@lerna/command");
const { packDirectory } = require("@lerna/pack-directory");
const { output } = require("@lerna/output");
const tar = require("tar");
const fs = require('fs')
const tempy = require("tempy");
const ChildProcessUtilities = require("@lerna/child-process");

const { ValidationError } = require("@lerna/validation-error");
module.exports = factory;

function factory(argv) {
  return new ZipBundleCommand(argv);
}

class ZipBundleCommand extends Command {
  get requiresGit() {
    return false;
  }

  async initialize() {
    if (!this.options.packageName) {
      throw new ValidationError('EFILTER', 'packageName positional argument is required')
    }
    this.package = this.packageGraph.get(this.options.packageName)
    if (!this.package) {
      throw new ValidationError(
        'EFILTER', util.format('packageName not recognized', this.options.packageName))
    }
    const packages = [this.package]
    this.packageGraph.addDependencies(packages)
    this.todoPackages = this.packageGraph.addDependencies([this.package])
    this.packed = {}
  }

  async execute() {
    for (const pkgTodo of this.todoPackages) {
      const pkg = this.packageGraph.get(pkgTodo.name)
      pkg.packed = await this.packOnePackage(pkg)
      this.packed[pkg.name] = pkg
      log.info('PackCommand.execute', 'Packaged %s to %s', pkg.name, pkg.packed.tarFilePath)
    }
    for (const pkgTodo of this.todoPackages) {
      const pkg = this.packageGraph.get(pkgTodo.name)
      await this.updateLocalDependencies(pkg)
    }
    const workdir = await this.installDependencies()
    const target = this.getTarget()
    await this.createZipFile(workdir, target)
    output(util.format('Wrote file', target))
  }

  getTarget() {
    if (this.options.target) {
      return path.resolve(this.options.target)
    }
    return path.resolve(`${this.package.name}-${this.package.version}.zip`)
  }
  async installDependencies() {

    const pkg = this.packageGraph.get(this.package.name)
    const workdir = tempy.directory()
    log.info('PackCommand.installDependencies', 'Installing dependencies in', workdir)
    await tar.extract({
      file: pkg.packed.tarFilePath,
      cwd: workdir
    })
    const cmd = 'npm'
    const args = ['install', '--production', '--ignore-scripts']
    if(this.options.legacyPeer) {
      args.push('--legacy-peer-deps')
    }
    const opts = {
      cwd: `${workdir}/package`
    }
    await ChildProcessUtilities.exec(cmd, args, opts);
    return workdir
  }

  createZipFile(workdir, target) {
    const cmd = 'zip'
    const args = ['-FSr', target, '.']
    const opts = {
      cwd: `${workdir}/package`
    }
    log.info('PackCommand.createZipFile', 'Running zip', args, opts)
    return ChildProcessUtilities.exec(cmd, args, opts);
  }

  async packOnePackage(pkg) {
    const opts = {}
    const packed = await packDirectory(pkg, pkg.location, opts)
    return packed
  }

  async updateLocalDependencies(pkg) {
    const workdir = tempy.directory()
    await tar.extract({
      file: pkg.packed.tarFilePath,
      cwd: workdir
    })
    const packageJson = this.readPackageJson(workdir)
    for (const [name] of pkg.localDependencies) {
      packageJson.dependencies[name] = `file:${this.packed[name].packed.tarFilePath}`
    }
    this.writePackageJson(workdir, packageJson)
    await tar.create({
      file: pkg.packed.tarFilePath,
      cwd: workdir,
      portable: true,
      // Provide a specific date in the 1980s for the benefit of zip,
      // which is confounded by files dated at the Unix epoch 0.
      mtime: new Date("1985-10-26T08:15:00.000Z"),
      gzip: true
    }, ['package'])
  }

  readPackageJson(workdir) {
    return JSON.parse(fs.readFileSync(`${workdir}/package/package.json`, { encoding: 'utf8' }))
  }
  writePackageJson(workdir, packageJson) {
    return fs.writeFileSync(
      `${workdir}/package/package.json`,
      JSON.stringify(packageJson),
      { encoding: 'utf8' })
  }
}

module.exports.ZipBundleCommand = ZipBundleCommand;
