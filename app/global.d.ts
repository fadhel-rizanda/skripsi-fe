declare module "*.css" {}

declare global {
  interface Window {
    Pusher: typeof import("pusher-js").default
  }
}