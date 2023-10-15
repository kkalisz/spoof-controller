import {CommandResult} from './command_result';
import {runCommand} from './command_executor';


export function adbDevicesCommand(): Promise<CommandResult> {

  return runCommand("adb devices")

}