import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function HeartIcon({ size = "h-6 w-6" }) {
  return (
    <svg className={`${size} text-white`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-2v2h-2v-2H8v-2h2V8h2v4h2v2z" />
    </svg>
  )
}

function SyringeIcon() {
  return (
    <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-15 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm13.5-5l-6-6-4 4 6 6 4-4z" />
    </svg>
  )
}

function PillIcon() {
  return (
    <svg className="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
    </svg>
  )
}

function PawIcon() {
  return (
    <svg className="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2zm6-4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-10 w-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-md">
              <HeartIcon />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MediConnect</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-700 hover:text-red-600 font-medium">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            Your Medical Support Partner
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect with hospitals, blood banks, pharmacies, and veterinary services all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-red-100">
            <CardHeader>
              <HospitalIcon />
              <CardTitle className="text-slate-800 font-semibold text-lg">Find Hospitals</CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Search for hospitals and check bed availability in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">
                <Link href="/hospitals">Browse Hospitals</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-red-100">
            <CardHeader>
              <SyringeIcon />
              <CardTitle className="text-slate-800 font-semibold text-lg">Blood Banks</CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Find blood banks and check blood availability by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">
                <Link href="/blood-banks">Find Blood Banks</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-red-100">
            <CardHeader>
              <div className="p-2 bg-red-600 rounded-lg w-fit">
                <HeartIcon />
              </div>
              <CardTitle className="text-slate-800 font-semibold text-lg">Donate Blood</CardTitle>
              <CardDescription className="text-slate-600 font-medium">Register as a blood donor and save lives</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">
                <Link href="/blood-donor">Become a Donor</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-blue-100">
            <CardHeader>
              <PillIcon />
              <CardTitle className="text-slate-800 font-semibold text-lg">Pharmacies</CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Locate nearby pharmacies and check medicine availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md">
                <Link href="/pharmacies">Find Pharmacies</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-green-100">
            <CardHeader>
              <PawIcon />
              <CardTitle className="text-slate-800 font-semibold text-lg">Pet Hospitals</CardTitle>
              <CardDescription className="text-slate-600 font-medium">Find veterinary hospitals for your pets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-md">
                <Link href="/pet-hospitals">Find Pet Hospitals</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-purple-100">
            <CardHeader>
              <SearchIcon />
              <CardTitle className="text-slate-800 font-semibold text-lg">Vaccine Info</CardTitle>
              <CardDescription className="text-slate-600 font-medium">Search for vaccine information and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md">
                <Link href="/vaccines">Search Vaccines</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-gradient-to-r from-red-50 to-blue-50 rounded-2xl p-8 border border-red-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to get started?</h3>
          <p className="text-slate-600 mb-6 font-medium">Join thousands of users connecting with medical services</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-red-200 text-red-700 hover:bg-red-50 font-medium">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/95 backdrop-blur-sm mt-16 shadow-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-1 bg-red-600 rounded">
              <HeartIcon size="h-4 w-4" />
            </div>
            <span className="text-slate-800 font-semibold">MediConnect</span>
          </div>
          <p className="text-slate-600 font-medium">&copy; 2025 MediConnect. Your Medical Support Partner.</p>
        </div>
      </footer>
    </div>
  )
}
