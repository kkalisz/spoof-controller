import {deviceInstances} from '../main';
import {getAdbConnectedDevices} from './adb_handler';
import {runCommand} from './command_executor';
import {delay} from '../utils/delay';
import {connectToDeviceAtPort, disconnectDeviceAtPort} from './adb_command_executor';


const oneMinute = 60 * 1000
const maxDeviceStartWaitTime = 6 * oneMinute // 6 min

export function startDeviceIfNeededByName(displayName: String){
  const deviceInstance = deviceInstances.find((instance) => instance.display_name)
  if(deviceInstance == null){
    // TODO log
  }
  return startDeviceIfNeeded(deviceInstance)
}

export async function startDeviceIfNeeded(instance: DeviceInstance): Promise<DeviceInfo | undefined> {
  const deviceInfo = await getDeviceInfoForInstance(instance)
  const isActive = checkDeviceInfoIsActive(deviceInfo)
  if(isActive){
    return deviceInfo
  }else{
    await connectToDeviceAtPort(instance.adb_port)
    const connectedDevice = await getDeviceInfoForInstance(instance)
    const isConnectedDeviceActive = checkDeviceInfoIsActive(connectedDevice)
    if(isConnectedDeviceActive){
      return connectedDevice
    }
    else {
      const freshDevice = await startDeviceInstance(instance)
      const isFreshDeviceActive = checkDeviceInfoIsActive(freshDevice)
      //log
      return freshDevice
    }
  }
}

export async function startDeviceInstance(instance: DeviceInstance): Promise<DeviceInfo | undefined >{
  const result = await runCommand(`C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe" --instance ${instance.instance_name}`)
  const start = new Date().getTime();
  let elapsed = new Date().getTime() - start

  await delay(oneMinute) // let's wait at least 1 minute
  while (elapsed < maxDeviceStartWaitTime){
    await connectToDeviceAtPort(instance.adb_port)
    const deviceInfo = await getDeviceInfoForInstance(instance)
    const isActive = checkDeviceInfoIsActive(deviceInfo)
    if(isActive){
      return deviceInfo
    }
    await delay(oneMinute)
    elapsed = new Date().getTime() - start
  }
  return null
}

export async function assignDeviceInstance(alreadyAssignedDevices: SimulatorDevice[]): Promise<DeviceInstance | undefined>{

  return null
}

export async function getDeviceInfoForInstance(instance: DeviceInstance): Promise<DeviceInfo|undefined>{
  const devices = await getAdbConnectedDevices();
  return devices.find((device) => device.port == instance.adb_port);
}

export async function checkDeviceIsRunning(instance: DeviceInstance): Promise<boolean>{
  const currentDeviceStatus = await getDeviceInfoForInstance(instance)
  return checkDeviceInfoIsActive(currentDeviceStatus);
}

export function checkDeviceInfoIsActive(deviceInfo: DeviceInfo| null | undefined): boolean {
  return deviceInfo?.info?.includes("connected") ?? false
}

export async function stopDevice(instance: DeviceInstance) {
  await disconnectDeviceAtPort(instance.adb_port)
  await runKillDeviceCommand(instance.instance_name) // TODO or display_name
  await delay(5 * 1000)
  return !(await checkDeviceIsRunning(instance))
}

function runKillDeviceCommand(instanceName: String){
  return runCommand(`taskkill /fi "WINDOWTITLE eq ${instanceName}" /IM "HD-Player.exe" /F`)
}