// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import {contextBridge, ipcRenderer} from 'electron';


window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }
});

export const deviceApi= {
  refresh: () => ipcRenderer.invoke('deviceApi:refresh'),
  start: () => ipcRenderer.invoke('deviceApi:start'),
  stop: () => ipcRenderer.invoke('deviceApi:stop')
}

contextBridge.exposeInMainWorld('deviceApi', deviceApi )