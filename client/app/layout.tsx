import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider, BitStreamProvider } from '@/contexts/BitStreamContext'

export const metadata: Metadata = {
  title: 'BitStream - Programmable Bitcoin Payment Streams',
  description: 'Automated Bitcoin payments with smart conditions and oracle integration',
  generator: 'BitStream',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BitStreamProvider>
            {children}
          </BitStreamProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
