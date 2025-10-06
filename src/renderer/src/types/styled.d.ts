import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    color: {
      main: string
      backgroud: string
      clickColor: string
      primary: {
        500: string
        300: string
      }
      gray: {
        500: string
        400: string
        300: string
      }
      container: {
        background: string
        border: string
      }
      text: {
        primary: string
        secondary: string
        disabled: string
      }
      input: {
        background: string
        placeholder: string
      }
      button: {
        hover: string
        active: string
        iconHover: string
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
