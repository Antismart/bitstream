import type { Metadata } from 'next'
import './globals.css'
import { IdentityKitWrapper } from '@/components/IdentityKitWrapper'
import { BitStreamProvider } from '@/contexts/BitStreamContext'

export const metadata: Metadata = {
  title: 'BitStream - Programmable Bitcoin Payment Streams',
  description: 'Simple, automated Bitcoin payment streams powered by Internet Computer',
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
        <IdentityKitWrapper>
          <BitStreamProvider>
            {children}
          </BitStreamProvider>
        </IdentityKitWrapper>
      </body>
    </html>
  )
}
