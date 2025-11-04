"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Syringe, Phone, MapPin, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BloodBankSearchClient() {
    const [bloodBanks, setBloodBanks] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [city, setCity] = useState("")
    const [bloodType, setBloodType] = useState("all")
    const [hasSearched, setHasSearched] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    const fetchBloodBanks = useCallback(async (cityFilter = "", bloodTypeFilter = "") => {
        console.log("🔍 Fetching blood banks with filters:", { cityFilter, bloodTypeFilter })

        if (!cityFilter.trim()) {
            setBloodBanks([])
            setHasSearched(false)
            return
        }

        setLoading(true)
        setError("")
        setHasSearched(true)

        try {
            const params = new URLSearchParams()
            if (cityFilter) params.append("city", cityFilter)
            if (bloodTypeFilter && bloodTypeFilter !== "all") params.append("bloodType", bloodTypeFilter)

            console.log("🌐 Making API call to:", `/api/blood-banks?${params.toString()}`)

            const response = await fetch(`/api/blood-banks?${params.toString()}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log("✅ API Response:", data)

            setBloodBanks(data.bloodBanks || [])
        } catch (err) {
            console.error("❌ Error fetching blood banks:", err)
            setError(err.message || "Failed to fetch blood banks")
            setBloodBanks([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Load initial data and handle URL parameters
    useEffect(() => {
        const cityParam = searchParams.get("city") || ""
        const bloodTypeParam = searchParams.get("bloodType") || "all"

        setCity(cityParam)
        setBloodType(bloodTypeParam)

        if (cityParam) {
            fetchBloodBanks(cityParam, bloodTypeParam)
        }
    }, [searchParams, fetchBloodBanks])

    const handleSearch = (e) => {
        e.preventDefault()
        console.log("🔍 Search triggered with:", { city, bloodType })

        // Update URL with search parameters
        const params = new URLSearchParams()
        if (city.trim()) params.append("city", city.trim())
        if (bloodType && bloodType !== "all") params.append("bloodType", bloodType)

        const newUrl = `/blood-banks?${params.toString()}`
        router.push(newUrl)

        // Trigger search
        fetchBloodBanks(city.trim(), bloodType === "all" ? "" : bloodType)
    }

    const handleCityChange = (e) => {
        setCity(e.target.value)
    }

    const handleBloodTypeChange = (value) => {
        setBloodType(value)
    }

    const clearSearch = () => {
        setCity("")
        setBloodType("all")
        setBloodBanks([])
        setHasSearched(false)
        setError("")
        router.push("/blood-banks")
    }

    return (
        <div className="space-y-8">
            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Blood Banks
                    </CardTitle>
                    <CardDescription>Find blood banks near you and check blood type availability</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={handleCityChange}
                                placeholder="Enter city name"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="bloodType">Blood Type (Optional)</Label>
                            <Select value={bloodType} onValueChange={handleBloodTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {bloodTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button type="submit" disabled={loading || !city.trim()} className="flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </>
                                )}
                            </Button>
                            {(city || bloodType !== "all") && (
                                <Button type="button" variant="outline" onClick={clearSearch}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error: {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {hasSearched && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>
                            {bloodBanks.length === 0
                                ? `No blood banks found in "${city}"${bloodType && bloodType !== "all" ? ` for blood type ${bloodType}` : ""}`
                                : `Found ${bloodBanks.length} blood bank${bloodBanks.length === 1 ? '' : 's'} in "${city}"${bloodType && bloodType !== "all" ? ` for blood type ${bloodType}` : ""}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {bloodBanks.length === 0 ? (
                            <div className="text-center py-8">
                                <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No blood banks found matching your criteria</p>
                                <p className="text-sm text-gray-400 mt-2">Try searching with a different city or remove the blood type filter</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {bloodBanks.map((bank) => (
                                    <Card key={bank.id} className="border hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-start justify-between">
                                                <span>{bank.name}</span>
                                                <Syringe className="h-5 w-5 text-red-500 mt-1" />
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {bank.city}, {bank.state}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{bank.phone}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{bank.address}</p>
                                            {bank.pincode && (
                                                <p className="text-sm text-muted-foreground">PIN: {bank.pincode}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Badge variant={bank.is_verified ? "default" : "secondary"}>
                                                    {bank.is_verified ? "Verified" : "Unverified"}
                                                </Badge>
                                                <Badge variant={bank.is_active ? "default" : "destructive"}>
                                                    {bank.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                            <Button className="w-full mt-4" variant="outline">
                                                <Phone className="mr-2 h-4 w-4" />
                                                Contact
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-lg">Searching blood banks...</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
