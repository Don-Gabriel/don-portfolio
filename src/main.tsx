import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

// Two pages share one bundle, split by route:
//   /         → the immersive universe (user-facing, always shipped)
//   /admin    → the command center (editor) — LOCAL-ONLY
//
// The admin is a private authoring tool: it is gated behind import.meta.env.DEV
// so it only exists when you run `npm run dev` on your own machine. In a
// production build the `import('./admin/AdminApp')` lives in a statically-false
// branch, so it is dead-code-eliminated — the admin is never deployed, and
// visiting /admin online simply shows the portfolio.
const path = window.location.pathname.replace(/\/+$/, '')
const isAdmin = path.endsWith('/admin') && import.meta.env.DEV

const App = lazy(() => import('./App'))
const AdminApp = import.meta.env.DEV
  ? lazy(() => import('./admin/AdminApp'))
  : null

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      {isAdmin && AdminApp ? <AdminApp /> : <App />}
    </Suspense>
  </React.StrictMode>,
)
