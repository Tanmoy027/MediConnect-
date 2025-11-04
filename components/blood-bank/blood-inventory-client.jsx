"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export default function BloodInventoryClient({ inventory, bloodBankId }) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [units, setUnits] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const getStockStatus = (units) => {
    if (units === 0) return { label: "Out of Stock", variant: "destructive" }
    if (units < 10) return { label: "Low Stock", variant: "secondary" }
    return { label: "In Stock", variant: "default" }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    if (!selectedType || !units) {
      toast({
        description: "Please select blood type and enter units",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/blood-bank/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodType: selectedType,
          units: Number.parseInt(units),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          description: `Added ${units} units of ${selectedType}`,
        })
        setUnits("")
        setSelectedType(null)
        setIsAdding(false)
        // Refresh page to update inventory
        window.location.reload()
      } else {
        toast({
          description: data.error || "Failed to add stock",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        description: "Error adding stock",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Stock Levels</CardTitle>
              <CardDescription>Manage your blood inventory</CardDescription>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddStock} className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <select
                    id="bloodType"
                    value={selectedType || ""}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="units">Units to Add</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    placeholder="Enter number of units"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Adding..." : "Add Stock"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bloodTypes.map((type) => {
              const item = inventory?.find((i) => i.blood_type === type)
              const availableUnits = item?.units_available || 0
              const status = getStockStatus(availableUnits)

              return (
                <Card key={type}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{type}</CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{availableUnits}</div>
                    <p className="text-sm text-muted-foreground">units available</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
