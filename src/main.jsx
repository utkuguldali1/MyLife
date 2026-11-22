import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './app/App.jsx'

// Starting point of the app: put <App /> into the page's "root" box.
// <HashRouter> lets the app switch pages based on the web address
// (e.g. ".../#/calendar"). The "#" style works on GitHub Pages, where
// refreshing a page like "/calendar" would otherwise show a 404 error.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
