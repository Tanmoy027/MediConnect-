import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function BloodDonorSearch({ searchParams }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const bloodType = params.bloodType
  const city = params.city

  let donors = []
  if (bloodType || city) {
    let query = supabase.from("users").select("*").eq("role", "normal_user").eq("is_blood_donor", true)

    if (bloodType) {
      query = query.eq("blood_type", bloodType)
    }

    if (city) {
      query = query.eq("city", city)
    }

    const { data } = await query
    donors = data || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-red-900">Blood Donor Search</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Blood Donors</CardTitle>
            <CardDescription>Find blood donors by type and location</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select defaultValue={bloodType || ""}>
                  <SelectTrigger id="bloodType" name="bloodType">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Enter city" defaultValue={city || ""} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {donors.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No donors found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {donors.map((donor) => (
              <Card key={donor.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{donor.full_name}</span>
                    <Badge className="bg-red-500">{donor.blood_type}</Badge>
                  </CardTitle>
                  <CardDescription>{donor.city}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{donor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{donor.phone || "N/A"}</p>
                  </div>
                  <Button className="w-full mt-4">Contact Donor</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
