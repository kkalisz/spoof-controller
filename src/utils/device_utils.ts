import {deviceInstances} from '../main';

export function getDeviceInstanceByName(instanceName: String){
  return deviceInstances.find((instance) => instance.instance_name == instanceName)
}

export function getDeviceInstanceByDisplayName(displayName: String){
  return deviceInstances.find((instance) => instance.display_name == displayName)
}