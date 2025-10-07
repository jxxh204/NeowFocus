// import 밑에서 쓰일 theme

const color = {
  main: '#D9D9D9',
  backgroud: '#F6F6F6',
  clickColor: '#000000CC',
  primary: {
    500: '#00FF85',
    400: '#1FAA67',
    300: '#B2FFDA'
  },
  gray: {
    500: '#8D8D8D',
    400: '#9CA3AF',
    300: '#D9D9D9'
  },
  black: '#000000',
  white: '#FFFFFF',
  // Container colors
  container: {
    background: 'rgba(39, 39, 39, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)'
  },
  // Text colors
  text: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.3)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    light: '#F5F5F5',
    muted: '#858585'
  },
  // Input colors
  input: {
    background: 'rgba(255, 255, 255, 0.04)',
    placeholder: 'rgba(255, 255, 255, 0.3)'
  },
  // Button colors
  button: {
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
    iconHover: 'rgba(123, 123, 123, 0.2)',
    disabled: {
      background: '#E8E8E8',
      text: '#8D8D8D',
      border: '#8D8D8D'
    },
    ghost: {
      hover: '#838383',
      hoverBorder: '#969696'
    }
  },
  // Timer colors
  Timer: {
    progress: '#FFFFFF',
    background: 'rgba(255, 255, 255, 0.1)',
    paused: '#8C8C8C'
  },
  // Toast colors
  toast: {
    background: '#333333',
    border: '#333333'
  }
}
const border = {
  radius: '6px',
  color: 'rgba(0, 0, 0, 0.1)'
}
const size = {
  gap: '8px'
}
const theme = { color, size, border }

export default theme
