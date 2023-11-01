import {CommandResult} from './command_result';
import {runCommand} from './command_executor';


export function adbDevicesCommand(): Promise<CommandResult> {
  return runCommand("adb devices")
}

export function connectToDeviceAtPort(port: String): Promise<CommandResult> {
  return runCommand(`adb connect 127.0.0.1:${port}`)
}

export function disconnectDeviceAtPort(port: String): Promise<CommandResult> {
  return runCommand(`adb disconnect 127.0.0.1:${port}`)
}

export function dumpsysDevice(instance: String): Promise<CommandResult> {
  return runCommand(`adb -s ${instance} shell dumpsys location`)
}