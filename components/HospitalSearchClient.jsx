"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hospital, Bed, Phone, MapPin, Truck, Heart, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function HospitalSearchClient() {
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [city, setCity] = useState("")
    const [service, setService] = useState("")
    const searchParams = useSearchParams()
    const router = useRouter()

    const fetchHospitals = useCallback(async (cityFilter = "", serviceFilter = "") => {
        console.log("🔍 fetchHospitals called with:", { cityFilter, serviceFilter })
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams()
            if (cityFilter) params.append("city", cityFilter)
            if (serviceFilter) params.append("service", serviceFilter)

            const url = `/api/hospitals?${params.toString()}`
            console.log("📡 Fetching from URL:", url)

            const response = await fetch(url)
            console.log("📡 Response status:", response.status)

            const data = await response.json()
            console.log("📡 Response data:", data)

            if (response.ok) {
                setHospitals(data.hospitals || [])
                console.log("✅ Hospitals set:", data.hospitals?.length || 0)
            } else {
                console.error("❌ API error:", data.error)
                setError(data.error || "Failed to fetch hospitals")
                setHospitals([])
            }
        } catch (error) {
            console.error("❌ Fetch error:", error)
            setError("Network error - unable to fetch hospitals")
            setHospitals([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Load initial data and handle URL parameters
    useEffect(() => {
        const cityParam = searchParams.get("city") || ""
        const serviceParam = searchParams.get("service") || ""

        setCity(cityParam)
        setService(serviceParam)

        fetchHospitals(cityParam, serviceParam)
    }, [searchParams, fetchHospitals])

    const handleSearch = (e) => {
        e.preventDefault()
        console.log("🔍 Form submitted with:", { city, service })

        // Update URL parameters
        const params = new URLSearchParams()
        if (city) params.append("city", city)
        if (service) params.append("service", service)

        const newUrl = `/hospitals?${params.toString()}`
        console.log("🔄 Navigating to:", newUrl)

        router.push(newUrl)
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Search Hospitals</CardTitle>
                    <CardDescription>Find hospitals by location and services</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter city"
                            />
                        </div>
                        <div>
                            <Label htmlFor="service">Service</Label>
                            <Input
                                id="service"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                placeholder="Enter service"
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

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Loading hospitals...</p>
                    </CardContent>
                </Card>
            ) : hospitals.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            {city || service ? "No hospitals found matching your criteria" : "No hospitals available"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {hospitals.map((hospital) => (
                        <Card key={hospital.id}>
                            <CardHeader>
                                <CardTitle>{hospital.name || "Hospital"}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {hospital.city}, {hospital.state}
                                </CardDescription>
                            </CardHeader>                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{hospital.phone}</p>
                                </div>
                                {hospital.emergency_phone && (
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <p className="font-medium text-red-600">Emergency: {hospital.emergency_phone}</p>
                                    </div>
                                )}
                                {hospital.address && (
                                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <Bed className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{hospital.bed_capacity || hospital.total_beds || "N/A"} beds</p>
                                </div>

                                {/* Emergency Services */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {hospital.emergency_available && (
                                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                                            <Heart className="h-3 w-3 mr-1" />
                                            Emergency
                                        </Badge>
                                    )}
                                    {hospital.ambulance_available && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                            <Truck className="h-3 w-3 mr-1" />
                                            Ambulance
                                        </Badge>
                                    )}
                                    {hospital.trauma_center && (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                            <Heart className="h-3 w-3 mr-1" />
                                            Trauma Center
                                        </Badge>
                                    )}
                                </div>

                                {/* Operating Hours */}
                                {hospital.emergency_hours && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Clock className="h-4 w-4 text-green-500" />
                                        <p className="text-sm text-green-600">Emergency: {hospital.emergency_hours}</p>
                                    </div>
                                )}

                                <Badge className="mt-2">
                                    {hospital.is_verified ? "Verified" : "Unverified"}
                                </Badge>
                                {hospital.email && (
                                    <p className="text-xs text-muted-foreground mt-1">Email: {hospital.email}</p>
                                )}
                                <Button className="w-full mt-4">View Details</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {error && (
                <Card className="border-red-200">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-600">Error: {error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
