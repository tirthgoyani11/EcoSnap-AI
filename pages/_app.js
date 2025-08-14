import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize eco points if not exists
    if (typeof window !== 'undefined' && !localStorage.getItem('ecoPoints')) {
      localStorage.setItem('ecoPoints', '0')
      localStorage.setItem('totalCO2Saved', '0')
      localStorage.setItem('scanHistory', JSON.stringify([]))
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
