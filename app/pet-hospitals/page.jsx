import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PawPrint, ArrowLeft, Phone, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function PetHospitalSearch({ searchParams }) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const city = params.city

  let petHospitals = []
  if (city) {
    const { data } = await supabase
      .from("pet_hospitals")
      .select("*")
      .eq("city", city)
      .eq("is_verified", true)
      .eq("is_active", true)
    petHospitals = data || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-900">Pet Hospital Finder</h1>
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
            <CardTitle>Search Pet Hospitals</CardTitle>
            <CardDescription>Find veterinary hospitals near you</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2">
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

        {petHospitals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No pet hospitals found in this city</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {petHospitals.map((hospital) => (
              <Card key={hospital.id}>
                <CardHeader>
                  <CardTitle>{hospital.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {hospital.city}, {hospital.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{hospital.phone}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{hospital.address}</p>
                  <Badge className="mt-2">{hospital.is_verified ? "Verified" : "Unverified"}</Badge>
                  <Button className="w-full mt-4">Contact</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
