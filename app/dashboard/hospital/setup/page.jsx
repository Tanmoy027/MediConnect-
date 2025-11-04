"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HospitalSetup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bedCapacity: "",
    availableBeds: "",
    emergencyAvailable: false,
    ambulanceAvailable: false,
    operatingHours: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          bed_capacity: Number.parseInt(formData.bedCapacity),
          available_beds: Number.parseInt(formData.availableBeds),
          emergency_available: formData.emergencyAvailable,
          ambulance_available: formData.ambulanceAvailable,
          operatingHours: formData.operatingHours
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create hospital')
      }

      router.push("/dashboard/hospital")
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard/hospital" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hospital Dashboard
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Hospital Setup</CardTitle>
            <CardDescription>Complete your hospital profile to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    required
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    required
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedCapacity">Total Bed Capacity *</Label>
                  <Input
                    id="bedCapacity"
                    type="number"
                    required
                    value={formData.bedCapacity}
                    onChange={(e) => handleChange("bedCapacity", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="availableBeds">Available Beds *</Label>
                  <Input
                    id="availableBeds"
                    type="number"
                    required
                    value={formData.availableBeds}
                    onChange={(e) => handleChange("availableBeds", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergencyAvailable"
                  checked={formData.emergencyAvailable}
                  onCheckedChange={(checked) => handleChange("emergencyAvailable", checked)}
                />
                <Label htmlFor="emergencyAvailable" className="cursor-pointer">
                  Emergency Services Available
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ambulanceAvailable"
                  checked={formData.ambulanceAvailable}
                  onCheckedChange={(checked) => handleChange("ambulanceAvailable", checked)}
                />
                <Label htmlFor="ambulanceAvailable" className="cursor-pointer">
                  Ambulance Services Available
                </Label>
              </div>

              {/* Operating Hours field - disabled until database migration is complete
              <div className="grid gap-2">
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  placeholder="e.g., 24/7 or Mon-Fri: 9AM-5PM"
                  value={formData.operatingHours}
                  onChange={(e) => handleChange("operatingHours", e.target.value)}
                />
              </div>
              */}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
