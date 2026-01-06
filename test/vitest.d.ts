// https://github.com/vitejs/vite/issues/9813
/** biome-ignore-all lint/complexity/noBannedTypes: vitest... */

declare type Worker = {};
declare type WebSocket = {};

declare namespace WebAssembly {
  type Module = {};
}
