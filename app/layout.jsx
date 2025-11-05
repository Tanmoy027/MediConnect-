import "./globals.css"

export const metadata = {
  title: "MediConnect - Your Medical Support Partner",
  description: "Connect with hospitals, blood banks, pharmacies, and more",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
