import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import BloodInventoryClient from "@/components/blood-bank/blood-inventory-client"

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
            <h1 className="text-2xl font-bold text-red-900">Blood Inventory</h1>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BloodInventoryClient inventory={inventory || []} bloodBankId={bloodBank.id} />
      </main>
    </div>
  )
}
