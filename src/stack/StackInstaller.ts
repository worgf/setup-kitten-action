import { addPath } from '@actions/core'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { Logger } from 'winston'
import Cache from '../Cache'
import { STACK_CLI_NAME } from '../consts'
import LoggerFactory from '../LoggerFactory'

export default class StackInstaller implements IInstaller {
  private VERSION: string = '1.0.0'
  private installDir: string = path.join(os.homedir(), '.local', 'bin')
  private log: Logger = LoggerFactory.create('StackInstaller')

  public async install(
    cache: ICache = new Cache(this.VERSION, STACK_CLI_NAME)): Promise<void> {
    fs.mkdirSync(this.installDir, { recursive: true })
    const osPlatform: string = os.platform()

    let dlCommand: string
    switch (osPlatform) {
    case 'linux':
      dlCommand = 'curl -L https://get.haskellstack.org/stable/linux-x86_64.tar.gz | tar xz --wildcards --strip-components=1 -C ' + this.installDir + ` \'*/${STACK_CLI_NAME}\'`
      break
    case 'darwin':
      dlCommand = `curl --insecure -L https://get.haskellstack.org/stable/osx-x86_64.tar.gz | tar xz --strip-components=1 --include \'*/${STACK_CLI_NAME}\' -C ${this.installDir}`
      break
    case 'win32':
      dlCommand = `PowerShell.exe -Command "&{Invoke-WebRequest -OutFile ${this.installDir}\\${STACK_CLI_NAME}.zip https://get.haskellstack.org/stable/windows-x86_64.zip  7z e ${this.installDir}\\${STACK_CLI_NAME}.zip -o${this.installDir} ${STACK_CLI_NAME}.exe  Remove-Item ${this.installDir}\\${STACK_CLI_NAME}.zip}"`
      break
    default:
      throw new Error(`${osPlatform} OS is unsupported`)
    }
    this.log.info(`Executing command below to install ${STACK_CLI_NAME}...`)
    this.log.info(`> ${dlCommand}`)

    execSync(dlCommand)
    addPath(this.installDir)
    const execFilePath: string = path.join(this.installDir, STACK_CLI_NAME)
    await cache.cache(execFilePath)
  }
}
