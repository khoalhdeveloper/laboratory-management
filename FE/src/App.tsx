import Router from "./router/Router"
import { GlobalThemeProvider } from "./contexts/GlobalThemeContext"

function App() {
  return (
    <GlobalThemeProvider>
      <Router />
    </GlobalThemeProvider>
  )
}

export default App
