import ReactDOM from 'react-dom/client'
import App from './App'
import GlobalStyle from './styles/GlobalStyle'
import { ThemeProvider } from 'styled-components'
import theme from './styles/theme'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>
)
