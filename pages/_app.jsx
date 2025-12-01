import '../styles/globals.css'
import { AdminProvider } from '../context/AdminContext'

export default function App({ Component, pageProps }) {
  return (
    <AdminProvider>
      <Component {...pageProps} />
    </AdminProvider>
  )
}
