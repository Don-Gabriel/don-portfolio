import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

// Two pages share one bundle, split by route:
//   /         → the immersive universe (user-facing)
//   /admin    → the command center (editor)
const path = window.location.pathname.replace(/\/+$/, '')
const isAdmin = path.endsWith('/admin')

const App = lazy(() => import('./App'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>{isAdmin ? <AdminApp /> : <App />}</Suspense>
  </React.StrictMode>,
)
