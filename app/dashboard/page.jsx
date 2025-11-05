import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function HeartIcon() {
  return (
    <svg className="h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg className="h-12 w-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-2v2h-2v-2H8v-2h2V8h2v4h2v2z" />
    </svg>
  )
}

function SyringeIcon() {
  return (
    <svg className="h-12 w-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-15 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm13.5-5l-6-6-4 4 6 6 4-4z" />
    </svg>
  )
}

function PillIcon() {
  return (
    <svg className="h-12 w-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
    </svg>
  )
}

function PawIcon() {
  return (
    <svg className="h-12 w-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-12 w-12 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="h-12 w-12 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
    </svg>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
  // Get user role and redirect to appropriate dashboard
  try {
    // Use admin client to get user role from the users table
    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role) {
      // Redirect based on user role
      switch (profile.role) {
        case "super_admin":
          redirect("/dashboard/super-admin")
          break
        case "blood_bank_admin":
          redirect("/dashboard/blood-bank")
          break
        case "hospital_admin":
          redirect("/dashboard/hospital")
          break
        case "pet_hospital_admin":
          redirect("/dashboard/pet-hospital")
          break
        // For normal_user or any other role, show the general dashboard
      }
    }
  } catch (error) {
    // Check if this is a Next.js redirect (expected behavior)
    if (error.message && error.message.includes('NEXT_REDIRECT')) {
      // This is a redirect, not an actual error - let it propagate
      throw error
    }
    console.error("Error getting user role:", error)
    // Continue to show general dashboard if role check fails
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon />
            <h1 className="text-2xl font-bold text-blue-900">MediConnect</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome to MediConnect</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-8">Dashboard</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/blood-donor">
              <CardHeader>
                <HeartIcon />
                <CardTitle>Blood Donor Search</CardTitle>
                <CardDescription>Find blood donors near you</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/hospitals">
              <CardHeader>
                <HospitalIcon />
                <CardTitle>Hospital Finder</CardTitle>
                <CardDescription>Locate hospitals with services</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/blood-banks">
              <CardHeader>
                <SyringeIcon />
                <CardTitle>Blood Bank Locator</CardTitle>
                <CardDescription>Find blood banks near you</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/pharmacies">
              <CardHeader>
                <PillIcon />
                <CardTitle>Pharmacy Finder</CardTitle>
                <CardDescription>Locate pharmacies</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/pet-hospitals">
              <CardHeader>
                <PawIcon />
                <CardTitle>Pet Hospital Finder</CardTitle>
                <CardDescription>Find veterinary hospitals</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/campaigns">
              <CardHeader>
                <UsersIcon />
                <CardTitle>Blood Donation Campaigns</CardTitle>
                <CardDescription>Join or organize campaigns</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/vaccines">
              <CardHeader>
                <SearchIcon />
                <CardTitle>Vaccine Availability</CardTitle>
                <CardDescription>Check vaccine availability</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  )
}
