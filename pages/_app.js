import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize eco data only on client side
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('ecoPoints')) {
        localStorage.setItem('ecoPoints', '0')
        localStorage.setItem('totalCO2Saved', '0')
        localStorage.setItem('scanHistory', JSON.stringify([]))
      }
    }
  }, [])

  return <Component {...pageProps} />
}
