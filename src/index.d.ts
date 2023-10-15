import {deviceApi} from './preload';

declare global {
  interface Window {deviceApi: typeof deviceApi }
}