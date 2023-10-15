// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.


document.getElementById('button-refresh-devices').addEventListener('click', async () => {
  const result = await window.deviceApi.refresh()
  document.getElementById('app-console').innerHTML = result.toString()
})

document.getElementById('button-start-device').addEventListener('click', async () => {
  const result = await window.deviceApi.start()
  document.getElementById('app-console').innerHTML = result.toString()
})

document.getElementById('button-kill-device').addEventListener('click', async () => {
  await window.deviceApi.stop()
  document.getElementById('button-kill-device').innerHTML = 'kill'
})