import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    color: {
      main: string
      backgroud: string
      clickColor: string
      primary: {
        500: string
        400: string
        300: string
      }
      gray: {
        500: string
        400: string
        300: string
      }
      black: string
      white: string
      container: {
        background: string
        border: string
      }
      text: {
        primary: string
        secondary: string
        disabled: string
        light: string
        muted: string
      }
      input: {
        background: string
        placeholder: string
      }
      button: {
        hover: string
        active: string
        iconHover: string
        disabled: {
          background: string
          text: string
          border: string
        }
        ghost: {
          hover: string
          hoverBorder: string
        }
      }
      Timer: {
        progress: string
        background: string
        paused: string
      }
      toast: {
        background: string
        border: string
      }
    }
    border: {
      radius: string
      color: string
    }
    size: {
      gap: string
    }
  }
}
