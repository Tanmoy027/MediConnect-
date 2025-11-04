import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function InventoryManagement() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role !== "blood_bank_admin") {
    redirect("/dashboard")
  }

  // Get blood bank info
  const { data: bloodBank } = await supabase.from("blood_banks").select("*").eq("admin_id", user.id).single()

  if (!bloodBank) {
    redirect("/dashboard/blood-bank/setup")
  }

  // Get inventory
  const { data: inventory } = await supabase
    .from("blood_inventory")
    .select("*")
    .eq("blood_bank_id", bloodBank.id)
    .order("blood_type")

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const getStockStatus = (units) => {
    if (units === 0) return { label: "Out of Stock", variant: "destructive" }
    if (units < 10) return { label: "Low Stock", variant: "secondary" }
    return { label: "In Stock", variant: "default" }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/blood-bank">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-blue-900">Blood Inventory</h1>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
            <CardDescription>Manage your blood inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodTypes.map((type) => {
                const item = inventory?.find((i) => i.blood_type === type)
                const units = item?.units_available || 0
                const status = getStockStatus(units)

                return (
                  <Card key={type}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{type}</CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{units}</div>
                      <p className="text-sm text-muted-foreground">units available</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
