"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Loader } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    address: "",
    city: "",
    state: "",
    startDate: "",
    endDate: "",
    targetDonors: "",
    contactNumber: "",
    contactEmail: "",
    requirements: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/blood-bank/admin/campaigns")
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.data)
      } else {
        toast({
          description: data.error || "Failed to fetch campaigns",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        description: "Error fetching campaigns",
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
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/blood-bank/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: "Campaign created successfully",
        })
        setFormData({
          title: "",
          description: "",
          venue: "",
          address: "",
          city: "",
          state: "",
          startDate: "",
          endDate: "",
          targetDonors: "",
          contactNumber: "",
          contactEmail: "",
          requirements: "",
        })
        setIsCreating(false)
        fetchCampaigns()
      } else {
        toast({
          description: data.error || "Failed to create campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        description: "Error creating campaign",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCampaignStatusColor = (status) => {
    const colors = {
      upcoming: "secondary",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    return colors[status] || "secondary"
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
            <h1 className="text-2xl font-bold text-red-900">Blood Donation Campaigns</h1>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Create Campaign Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Start a blood donation drive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Summer Blood Drive 2024"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the campaign"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      required
                      value={formData.venue}
                      onChange={(e) => handleChange("venue", e.target.value)}
                      placeholder="e.g., Community Center"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
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
                    <Label htmlFor="targetDonors">Target Donors</Label>
                    <Input
                      id="targetDonors"
                      type="number"
                      value={formData.targetDonors}
                      onChange={(e) => handleChange("targetDonors", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange("contactNumber", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                    placeholder="Donor requirements, age limits, health conditions, etc."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Campaigns</h2>
            <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No campaigns yet. Create your first campaign!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge variant={getCampaignStatusColor(campaign.status)}>{campaign.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Venue</p>
                        <p className="font-medium">{campaign.venue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {campaign.city}, {campaign.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Donors</p>
                        <p className="font-medium">{campaign.target_donors || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contact</p>
                        <p className="font-medium">{campaign.contact_number}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
