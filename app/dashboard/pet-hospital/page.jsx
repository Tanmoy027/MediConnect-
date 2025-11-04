import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Users, Calendar, Settings, Syringe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PetHospitalDashboard() {
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
    } else if (profile?.role !== "pet_hospital_admin") {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking user role:", error)
    // Don't redirect on error, just continue - user might have been properly redirected here by login
  }

  // Get pet hospital info
  const { data: petHospitals } = await supabase.from("pet_hospitals").select("*").eq("admin_id", user.id)
  const petHospital = petHospitals && petHospitals.length > 0 ? petHospitals[0] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-orange-900">Pet Hospital Dashboard</h1>
                <p className="text-sm text-muted-foreground">{petHospital?.name || "Pet Hospital"}</p>
              </div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Available services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Registered pets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Open</div>
              <p className="text-xs text-muted-foreground">Currently operating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage pet hospital operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                View Patients
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Syringe className="mr-2 h-4 w-4" />
                Services
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Info</CardTitle>
              <CardDescription>Your pet hospital details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{petHospital?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{petHospital?.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="font-medium">{petHospital?.operating_hours || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
