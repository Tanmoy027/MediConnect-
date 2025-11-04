import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Syringe, Package, Users, Calendar, Settings, ArrowLeft } from "lucide-react"

export default async function BloodBankDashboard() {
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
    } else if (profile?.role !== "blood_bank_admin") {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking user role:", error)
    // Don't redirect on error, just continue - user might have been properly redirected here by login
  }

  // Get blood bank info
  const { data: bloodBanks } = await supabase.from("blood_banks").select("*").eq("admin_id", user.id)
  const bloodBank = bloodBanks && bloodBanks.length > 0 ? bloodBanks[0] : null

  let inventory = []
  if (bloodBank?.id) {
    const { data } = await supabase.from("blood_inventory").select("*").eq("blood_bank_id", bloodBank.id)
    inventory = data || []
  }

  const totalUnits = inventory.reduce((sum, item) => sum + (item.units_available || 0), 0)

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
              <Syringe className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-red-900">Blood Bank Dashboard</h1>
                <p className="text-sm text-muted-foreground">{bloodBank?.name || "Blood Bank"}</p>
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
              <CardTitle className="text-sm font-medium">Total Blood Units</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs text-muted-foreground">Available units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Types</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}/8</div>
              <p className="text-xs text-muted-foreground">Types in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Registered donors</p>
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your blood bank operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/blood-bank/inventory">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                View Donors
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
