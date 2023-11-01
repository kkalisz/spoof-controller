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
    instance['instance_name'] = instanceData

    deviceInstances.push(instance);
  });

  return deviceInstances;
}
