"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function VaccinesPage() {
  const [vaccines, setVaccines] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const supabase = createClient()

  const searchVaccines = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      // Search across all hospitals for vaccines matching the search term
      const { data, error } = await supabase
        .from("vaccines")
        .select(`
          *,
          vaccine_availability!inner (
            id,
            available_doses,
            price,
            hospital_id,
            hospitals!vaccine_availability_hospital_id_fkey (
              id,
              name,
              city,
              address,
              phone
            )
          )
        `)
        .ilike("name", `%${searchTerm}%`)
        .gt("vaccine_availability.available_doses", 0)

      if (error) {
        console.error("Error searching vaccines:", error)
      } else {
        // Flatten the data to show each hospital's availability separately
        const flattenedVaccines = []
        data?.forEach(vaccine => {
          vaccine.vaccine_availability.forEach(availability => {
            flattenedVaccines.push({
              ...vaccine,
              availability: availability,
              hospital: availability.hospitals
            })
          })
        })
        setVaccines(flattenedVaccines)
      }
    } catch (error) {
      console.error("Error searching vaccines:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-indigo-900">Vaccine Availability</h1>
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
            <CardTitle>Search Vaccines</CardTitle>
            <CardDescription>Find vaccine availability across hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchVaccines} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="vaccineName">Vaccine Name</Label>
                <Input
                  id="vaccineName"
                  name="vaccineName"
                  placeholder="e.g., COVID-19, Polio, Hepatitis"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching for vaccines...</p>
          </div>
        )}

        {!loading && hasSearched && vaccines.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No vaccines found matching "{searchTerm}". Try searching with a different name.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && vaccines.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vaccines.map((vaccine, index) => (
              <Card key={`${vaccine.id}-${vaccine.availability.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{vaccine.name}</CardTitle>
                  <CardDescription>{vaccine.manufacturer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-b pb-3">
                    <p className="text-sm font-semibold text-indigo-600">{vaccine.hospital.name}</p>
                    <p className="text-sm text-muted-foreground">{vaccine.hospital.city}</p>
                    <p className="text-sm text-muted-foreground">{vaccine.hospital.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Doses</p>
                    <p className="font-medium text-green-600">{vaccine.availability.available_doses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Dose</p>
                    <p className="font-medium">₹{vaccine.availability.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doses Required</p>
                    <p className="font-medium">{vaccine.doses_required}</p>
                  </div>
                  {vaccine.age_group && (
                    <div>
                      <p className="text-sm text-muted-foreground">Age Group</p>
                      <p className="font-medium">{vaccine.age_group}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500">Available</Badge>
                    <Button size="sm" className="mt-2">Book Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasSearched && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Search for Vaccines</h3>
                <p className="text-muted-foreground">
                  Enter a vaccine name above to find availability across hospitals in your area.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
