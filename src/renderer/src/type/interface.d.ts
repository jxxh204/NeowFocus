export interface Electron {
  sendMessage: (action, args) => void
}
export type MouseMove = {
  mouseX: number
  mouseY: number
}
export interface Versions {
  ping: () => void
}
