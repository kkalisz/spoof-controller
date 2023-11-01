import {adbDevicesCommand, dumpsysDevice} from './adb_command_executor';
import {getDeviceInfoForInstance} from './devcice_commands';
import {getDeviceInstanceByName} from '../utils/device_utils';


function getAdbDeviceNameFromDeviceInfo(deviceInfo: DeviceInfo){
  return `${deviceInfo.ip}:${deviceInfo.port}`
}

export async function getAdbConnectedDevices() {
  const adbDevicesResult = await adbDevicesCommand();
  if(adbDevicesResult.error){
    console.log(adbDevicesResult.error)
  }
  return parseAdbDeviceList(adbDevicesResult.result);
}

function parseAdbDeviceList(input: string): DeviceInfo[] {
  const lines = input.split('\n');
  const deviceList: DeviceInfo[] = [];

  // Remove the header line
  lines.shift();

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const ipPort = parts[0].split(":")
      const ip = ipPort[0];
      const port = ipPort[1];
      const info = parts.slice(1).join(' ');
      deviceList.push({ ip, port, info });
    }
  }

  return deviceList;
}

export async function getDeviceDetails(instanceName: String) {
  const instance =  getDeviceInstanceByName(instanceName);
  const connectedDevice = await getDeviceInfoForInstance(instance)
  getGpsDeviceDetails(connectedDevice.info)


}

export async function getGpsDeviceDetails(adbDeviceName: String): Promise<LocationInfo[] | null> {
  const adbDevicesResult = await dumpsysDevice(adbDeviceName)
  if(adbDevicesResult.result){
    return parseLocationInfo(adbDevicesResult.result)
  }
  return []
}

export function parseLocationInfo(inputString: string): LocationInfo[] {
  const locationRegex = /(\w+):\sLocation\[(\w+)\s(-?\d+\.\d+),(-?\d+\.\d+)/g;

  const result: LocationInfo[] = [];
  let match: RegExpExecArray | null;

  while ((match = locationRegex.exec(inputString)) !== null) {
    const provider = match[1];
    const name = match[2];
    const latitude = parseFloat(match[3]);
    const longitude = parseFloat(match[4]);

    const locationInfo: LocationInfo = {
      Provider: provider,
      Name: name,
      Latitude: latitude,
      Longitude: longitude,
    };

    result.push(locationInfo);
  }

  return result;
}