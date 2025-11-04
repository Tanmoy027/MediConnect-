"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader } from "lucide-react"

export default function BloodBankProfilePage() {
  const [bloodBank, setBloodBank] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    license_number: "",
    operating_hours: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBloodBank()
  }, [])

  const fetchBloodBank = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/blood-bank/admin/profile")
      const data = await response.json()

      if (data.success) {
        setBloodBank(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email || "",
          phone: data.data.phone,
          address: data.data.address,
          city: data.data.city,
          state: data.data.state,
          pincode: data.data.pincode,
          license_number: data.data.license_number || "",
          operating_hours: data.data.operating_hours || "",
        })
      }
    } catch (error) {
      toast({
        description: "Error loading profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/blood-bank/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: "Profile updated successfully",
        })
        setBloodBank(data.data)
      } else {
        toast({
          description: data.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        description: "Error updating profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    )
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
            <h1 className="text-2xl font-bold text-red-900">Blood Bank Profile</h1>
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
            <CardTitle>Edit Blood Bank Information</CardTitle>
            <CardDescription>Update your blood bank details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Blood Bank Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input value={formData.state} onChange={(e) => handleChange("state", e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input value={formData.pincode} onChange={(e) => handleChange("pincode", e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleChange("license_number", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Input
                    id="operating_hours"
                    placeholder="e.g., Mon-Fri: 9AM-5PM"
                    value={formData.operating_hours}
                    onChange={(e) => handleChange("operating_hours", e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
