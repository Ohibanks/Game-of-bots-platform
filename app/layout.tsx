import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Game of Bots - Lagos Sprint Trading Competition',
  description: 'Monthly forex trading competition - Where only the strongest algorithms survive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
