import Navbar from './Navbar'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'

export default function Layout({ children, fullHeight = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${fullHeight ? 'pt-16 flex flex-col' : 'pt-16'}`}>
      {/* <main className={`flex-1 ${fullHeight ? 'pt-16 flex flex-col' : 'pt-16'}`}
  style={fullHeight ? { position: 'relative', zIndex: 0 } : {}}> */}
        {children}
      </main>
      {!fullHeight && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
    </div>
  )
}
