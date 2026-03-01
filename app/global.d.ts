declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

import Pusher from "pusher-js"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}