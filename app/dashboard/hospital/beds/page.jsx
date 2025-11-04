"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BedManagement() {
  const [hospital, setHospital] = useState(null)
  const [availableBeds, setAvailableBeds] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchHospital = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase.from("hospitals").select("*").eq("admin_id", user.id).single()

      if (data) {
        setHospital(data)
        setAvailableBeds(data.available_beds?.toString() || "0")
      }
    }

    fetchHospital()
  }, [router])

  const handleUpdate = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from("hospitals")
        .update({ available_beds: Number.parseInt(availableBeds) })
        .eq("id", hospital.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hospital) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/hospital">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-blue-900">Bed Management</h1>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Update Bed Availability</CardTitle>
            <CardDescription>Keep your bed availability information up to date</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label>Total Bed Capacity</Label>
                <Input value={hospital.bed_capacity} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="availableBeds">Available Beds *</Label>
                <Input
                  id="availableBeds"
                  type="number"
                  min="0"
                  max={hospital.bed_capacity}
                  required
                  value={availableBeds}
                  onChange={(e) => setAvailableBeds(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">Bed availability updated successfully!</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Availability"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
