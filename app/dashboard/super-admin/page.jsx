import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Hospital, PawPrint, Users, Pill, Syringe, Settings, BarChart3, Shield } from "lucide-react"

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
  // Get user role using admin client to bypass RLS issues
  try {
    const supabaseAdmin = createAdminClient()
    const { data: profile, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching user role:", error)
      // Don't redirect on error, just continue - user might have been properly redirected here by login
    } else if (profile?.role !== "super_admin") {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking user role:", error)
    // Don't redirect on error, just continue - user might have been properly redirected here by login
  }

  // Get statistics
  const usersResult = await supabase.from("users").select("*", { count: "exact", head: true })
  const bloodBanksResult = await supabase.from("blood_banks").select("*", { count: "exact", head: true })
  const hospitalsResult = await supabase.from("hospitals").select("*", { count: "exact", head: true })
  const petHospitalsResult = await supabase.from("pet_hospitals").select("*", { count: "exact", head: true })

  const usersCount = usersResult.count || 0
  const bloodBanksCount = bloodBanksResult.count || 0
  const hospitalsCount = hospitalsResult.count || 0
  const petHospitalsCount = petHospitalsResult.count || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-900">Super Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">User View</Link>
            </Button>
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
        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blood Banks</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bloodBanksCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
              <Hospital className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hospitalsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pet Hospitals</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{petHospitalsCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Management</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/users">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-500 mb-2" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users and their roles</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/blood-banks">
              <CardHeader>
                <Syringe className="h-12 w-12 text-green-500 mb-2" />
                <CardTitle>Blood Banks</CardTitle>
                <CardDescription>Manage blood banks and verify them</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/hospitals">
              <CardHeader>
                <Hospital className="h-12 w-12 text-red-500 mb-2" />
                <CardTitle>Hospitals</CardTitle>
                <CardDescription>Manage hospitals and verify them</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/pet-hospitals">
              <CardHeader>
                <PawPrint className="h-12 w-12 text-orange-500 mb-2" />
                <CardTitle>Pet Hospitals</CardTitle>
                <CardDescription>Manage pet hospitals</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/pharmacies">
              <CardHeader>
                <Pill className="h-12 w-12 text-purple-500 mb-2" />
                <CardTitle>Pharmacies</CardTitle>
                <CardDescription>Manage pharmacy listings</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/vaccines">
              <CardHeader>
                <Heart className="h-12 w-12 text-pink-500 mb-2" />
                <CardTitle>Vaccines</CardTitle>
                <CardDescription>Manage vaccine database</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/campaigns">
              <CardHeader>
                <Users className="h-12 w-12 text-cyan-500 mb-2" />
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Monitor blood donation campaigns</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/reports">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-indigo-500 mb-2" />
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View system analytics</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/dashboard/super-admin/settings">
              <CardHeader>
                <Settings className="h-12 w-12 text-gray-500 mb-2" />
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  )
}
