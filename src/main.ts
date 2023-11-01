import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import {extractDeviceInstances, readBluestackConfigFile} from './model/bluestack_config_reader';
import {getAdbConnectedDevices, parseLocationInfo} from './commands/adb_handler';
import { createClient } from '@supabase/supabase-js'
import {
  assignDeviceInstance,
  checkDeviceIsRunning,
  startDeviceIfNeeded, startDeviceInstance,
  stopDevice
} from './commands/devcice_commands';
import {getDeviceInstanceByName} from './utils/device_utils';

const electron = require('electron');
const ipcMain       = require('electron').ipcMain

export let deviceInstances: DeviceInstance[] = [];


export const supabase = createClient('https://bjoajujtzlgrftgjaqdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb2FqdWp0emxncmZ0Z2phcWRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODQwNDY0NSwiZXhwIjoyMDEzOTgwNjQ1fQ.mCmC_b5aymPjZdsGca0unBYkNxHqcJ2raPwmczighHA')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  registerSimulatorUpdate()
}

const handleDeviceInsert = (payload: any) => {
  console.log('Change received!', payload)
}

const filterFreeDevices = async () => {

}

async function getActuallyAssignedDevices(): Promise<SimulatorDevice[]> {
  let {data: simulator_device, error} = await supabase.from("simulator_device").select("*")

  const mappedData = simulator_device.map((value, index, _) => value as undefined as SimulatorDevice)
  return mappedData
}

async function updateSyncLogForSimulator(id: number, syncLog: String): Promise<boolean>{
  return updateValuesForSimulator(id, { sync_log: syncLog})
}

async function updateSyncLogForSimulatorIfDifferent(simulatorDevice: SimulatorDevice, syncLog: String): Promise<boolean>{
  if(simulatorDevice.sync_loc == syncLog){
    return false
  }
  return updateValuesForSimulator(simulatorDevice.id, { sync_log: syncLog})
}

async function updateValuesForSimulator(id: number, valuesToUpdate: any): Promise<boolean>{
  const { data, error } = await supabase
    .from('simulator_device')
    .update(valuesToUpdate)
    .eq('id', id)
    .select()
  return true
}


const handleDeviceUpdate = async (payload: any) => {
  console.log(payload)
  const deviceUpdateResponse: BaseRealtimeResponse<SimulatorDevice> = payload as undefined as BaseRealtimeResponse<SimulatorDevice>;
  const deviceUpdate = deviceUpdateResponse.new

  await refreshDevicesConfig()
  const alreadyAssignedDevices = await getActuallyAssignedDevices()

  if(deviceUpdate.is_active && !deviceUpdate.instance_name){
    // assign device
    const assignedDevice = await assignDeviceInstance(alreadyAssignedDevices)
    if (assignedDevice != null) {
      //TODO would be good to start simulator and install all required things
      try {
        const deviceInfo = await startDeviceIfNeeded(assignedDevice)
        if(deviceInfo != null){

        }else{
          await updateValuesForSimulator(deviceUpdate.id, {"instance_name": assignedDevice.instance_name, sync_log: `instance assigned to: ${assignedDevice.instance_name}`})
        }
      }catch (e){
        console.log(e)
      }
      await updateValuesForSimulator(deviceUpdate.id, {"instance_name": assignedDevice.instance_name, sync_log: `instance assigned to: ${assignedDevice.instance_name}`})
    } else {
      await updateSyncLogForSimulatorIfDifferent(deviceUpdate, "could not assign device")
    }
    return
  }

  // now we have instance

  const device = getDeviceInstanceByName(deviceUpdate.instance_name)

  if(device == null){
    await updateSyncLogForSimulatorIfDifferent(deviceUpdate, "could not find device")
    return
  }

  if(deviceUpdate.is_active){
    if(deviceUpdate.should_run){
      await startDeviceIfNeeded(device)
    }else{
      await stopDevice(device)
    }

  }else{
    const isRunning = await checkDeviceIsRunning(device)
    if (isRunning) {
      await stopDevice(device)
      //TODO log was stopped
      //TODO mark to delete
    }
  }


  // if(deviceUpdate.is_active){
  //   if(device == null){
  //     if(deviceUpdate.instance_name){
  //       // we have instance name but don't have that instance created, someone deleted etc
  //       await updateSyncLogForSimulatorIfDifferent(deviceUpdate, `instance: ${deviceUpdate.instance_name} not found on specific host`)
  //     }else {
  //       const assignedDevice = await assignDeviceInstance(alreadyAssignedDevices)
  //       if (assignedDevice != null) {
  //         await updateValuesForSimulator(deviceUpdate.id, {"instance_name": assignedDevice.instance_name, sync_log: `instance assigned to: ${assignedDevice.instance_name}`})
  //       } else {
  //         await updateSyncLogForSimulatorIfDifferent(deviceUpdate, "could not assign device")
  //       }
  //     }
  //   }
  // }else{
  //   if(device != null){
  //     const isRunning = await checkDeviceIsRunning(device)
  //     if(isRunning){
  //       await stopDevice(device)
  //       //TODO mark to delete
  //     }
  //   }
  // }


  // if(deviceUpdate.new.is_active){
  //   if(device != null){
  //     console.log(device)
  //     const isRunning = await checkDeviceIsRunning(device)
  //     if(deviceUpdate.new.should_run){
  //       if(!isRunning){
  //         const startResult = await startDeviceIfNeeded(device)
  //       }
  //       const isRunningNow = await checkDeviceIsRunning(device)
  //
  //
  //     }else{
  //         if(isRunning){
  //           // device should be stopped
  //           await stopDevice(device)
  //         } else{
  //           // device is stopped and should be stopped
  //         }
  //     }
  //   }else{
  //     // get list of already taken devices
  //     // obtain available devices
  //
  //     //
  //   }
  //
  // }else{
  //   // stop and remove
  // }
}

function registerSimulatorUpdate(){
  supabase
    .channel('simulator_device_insert')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulator_device' }, handleDeviceInsert)
    .subscribe()

  supabase
    .channel('simulator_device')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'simulator_device' }, handleDeviceUpdate)
    .subscribe()

}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

async function refreshDevicesConfig() {
  const configFilePath = './bluestacks.conf';
  const config = readBluestackConfigFile(configFilePath);
  return extractDeviceInstances(config);
}

ipcMain.handle('deviceApi:refresh', async () => {
  deviceInstances = await refreshDevicesConfig();

  const result = await deviceInstances
  const adbDevices = await getAdbConnectedDevices();

  return adbDevices
})

ipcMain.handle('deviceApi:start', () => {

})

ipcMain.handle('deviceApi:stop', () => {

})