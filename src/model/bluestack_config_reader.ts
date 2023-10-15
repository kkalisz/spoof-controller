import * as fs from 'fs';

const keysToExtract: string[] = [
  'abi_list',
  'adb_port',
  'ads_display_time',
  'airplane_mode_active',
  'airplane_mode_active_time',
  'android_google_ad_id',
  'android_id',
  'android_sound_while_tapping',
  'app_launch_count',
  'astc_decoding_mode',
  'autohide_notifications',
  'boot_duration',
  'camera_device',
  'cpus',
  'custom_resolution_selected',
  'device_carrier_code',
  'device_country_code',
  'device_custom_brand',
  'device_custom_manufacturer',
  'device_custom_model',
  'device_profile_code',
  'display_name',
  'dpi',
  'eco_mode_max_fps',
  'enable_fps_display',
  'enable_fullscreen_all_apps',
  'enable_high_fps',
  'enable_logcat_redirection',
  'enable_notifications',
  'enable_root_access',
  'enable_vsync',
  'fb_height',
  'fb_width',
  'first_boot',
  'game_controls_enabled',
  'gl_win_height',
  'gl_win_screen',
  'gl_win_x',
  'gl_win_y',
  'google_account_logins',
  'google_login_popup_shown',
  'graphics_engine',
  'graphics_renderer',
  'grm_ignored_rules',
  'launch_date',
  'libc_mem_allocator',
  'macro_win_height',
  'macro_win_screen',
  'macro_win_x',
  'macro_win_y',
  'max_fps',
  'pin_to_top',
  'ram',
  'show_sidebar',
  'status.adb_port',
  'status.ip_addr_prefix_len',
  'status.ip_gateway_addr',
  'status.ip_guest_addr',
  'status.session_id',
  'vulkan_supported',
];

// Add or remove keys as needed


interface DeviceInstance {

  [key: string]: string;

  abi_list: string;
  adb_port: string;
  ads_display_time: string;
  airplane_mode_active: string;
  airplane_mode_active_time: string;
  android_google_ad_id: string;
  android_id: string;
  android_sound_while_tapping: string;
  app_launch_count: string;
  astc_decoding_mode: string;
  autohide_notifications: string;
  boot_duration: string;
  camera_device: string;
  cpus: string;
  custom_resolution_selected: string;
  device_carrier_code: string;
  device_country_code: string;
  device_custom_brand: string;
  device_custom_manufacturer: string;
  device_custom_model: string;
  device_profile_code: string;
  display_name: string;
  dpi: string;
  eco_mode_max_fps: string;
  enable_fps_display: string;
  enable_fullscreen_all_apps: string;
  enable_high_fps: string;
  enable_logcat_redirection: string;
  enable_notifications: string;
  enable_root_access: string;
  enable_vsync: string;
  fb_height: string;
  fb_width: string;
  first_boot: string;
  game_controls_enabled: string;
  gl_win_height: string;
  gl_win_screen: string;
  gl_win_x: string;
  gl_win_y: string;
  google_account_logins: string;
  google_login_popup_shown: string;
  graphics_engine: string;
  graphics_renderer: string;
  grm_ignored_rules: string;
  launch_date: string;
  libc_mem_allocator: string;
  macro_win_height: string;
  macro_win_screen: string;
  macro_win_x: string;
  macro_win_y: string;
  max_fps: string;
  pin_to_top: string;
  ram: string;
  show_sidebar: string;
  // @ts-ignore
  status: {
    adb_port: string;
    ip_addr_prefix_len: string;
    ip_gateway_addr: string;
    ip_guest_addr: string;
    session_id: string;
  };
  vulkan_supported: string;
}

export function readBluestackConfigFile(filePath: string): Record<string, string> {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    const config: Record<string, string> = {};

    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        config[key] = value;
      }
    }

    return config;
  } catch (err) {
    console.error('Error reading the JSON file:', err);
    return {};
  }
}

export function extractDeviceInstances(config: Record<string, string>): DeviceInstance[] {
  const deviceInstances: DeviceInstance[] = [];
  const instanceKeys: string[] = Object.keys(config).filter((key) =>
    key.startsWith('bst.instance.')
  ).map( (it) => it.split('.')[2]).filter(function (x, i, a) {
    return a.indexOf(x) == i; // only unique values
  });

  instanceKeys.forEach((instanceKey) => {
    const instance: DeviceInstance = {} as DeviceInstance;
    const instanceData = instanceKey.split('.')[2];

    for (const key of keysToExtract) {
      const fullKey = `bst.instance.${instanceData}.${key}`;
      if (config[fullKey]) {
        instance[key] = config[fullKey];
      }
    }

    deviceInstances.push(instance);
  });

  return deviceInstances;
}
