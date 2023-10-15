import {adbDevicesCommand} from './adb_executor';


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