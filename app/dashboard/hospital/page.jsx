"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hospital, Bed, Users, Calendar, Settings, Plus, Edit, Trash2, Check, X, Syringe, ArrowLeft, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HospitalDashboard() {
  const [user, setUser] = useState(null)
  const [hospital, setHospital] = useState(null)
  const [beds, setBeds] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Emergency states
  const [emergencyStats, setEmergencyStats] = useState({
    activeRequests: 0,
    inProgressRequests: 0,
    completedToday: 0
  })
  const [emergencyRequests, setEmergencyRequests] = useState([])
  const [emergencyServices, setEmergencyServices] = useState([])

  // Dialog states
  const [isVaccineDialogOpen, setIsVaccineDialogOpen] = useState(false)
  const [editingVaccine, setEditingVaccine] = useState(null)
  const [isEmergencyStatusDialogOpen, setIsEmergencyStatusDialogOpen] = useState(false)
  const [isAmbulanceStatusDialogOpen, setIsAmbulanceStatusDialogOpen] = useState(false)
  const [isTraumaCenterDialogOpen, setIsTraumaCenterDialogOpen] = useState(false)
  const [isEmergencyContactsDialogOpen, setIsEmergencyContactsDialogOpen] = useState(false)

  // Form states
  const [vaccineForm, setVaccineForm] = useState({
    name: "",
    manufacturer: "",
    description: "",
    age_group: "",
    doses_required: 1,
    available_doses: 0,
    price: 0
  })

  const [emergencyStatusForm, setEmergencyStatusForm] = useState({
    emergency_available: true,
    emergency_available_beds: 0
  })

  const [ambulanceStatusForm, setAmbulanceStatusForm] = useState({
    ambulance_available: false
  })

  const [traumaCenterForm, setTraumaCenterForm] = useState({
    trauma_center: false
  })

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        window.location.href = "/auth/login"
        return
      }
      setUser(currentUser)

      // Fetch hospital data
      const hospitalResponse = await fetch('/api/hospital')
      const hospitalData = await hospitalResponse.json()

      console.log("Hospital API response:", hospitalData)

      if (hospitalData.error || !hospitalData.success) {
        console.error("Hospital API error:", hospitalData.error)
        toast({
          title: "Error",
          description: "Failed to load hospital data",
          variant: "destructive"
        })
        return
      }

      if (hospitalData.data && hospitalData.data.needsSetup) {
        // Hospital admin doesn't have a hospital setup yet
        window.location.href = "/dashboard/hospital/setup"
        return
      }

      if (hospitalData.success && hospitalData.data && hospitalData.data.hospital) {
        console.log("Setting hospital data:", hospitalData.data.hospital)
        setHospital(hospitalData.data.hospital)

        // Initialize emergency forms with current hospital data
        setEmergencyStatusForm({
          emergency_available: hospitalData.data.hospital.emergency_available || true,
          emergency_available_beds: hospitalData.data.hospital.emergency_available_beds || 0
        })
        setAmbulanceStatusForm({
          ambulance_available: hospitalData.data.hospital.ambulance_available || false
        })
        setTraumaCenterForm({
          trauma_center: hospitalData.data.hospital.trauma_center || false
        })

        // Fetch beds
        const { data: bedsData } = await supabase
          .from("hospital_beds")
          .select("*")
          .eq("hospital_id", hospitalData.data.hospital.id)
        setBeds(bedsData || [])

        // Fetch vaccines
        await fetchVaccines(hospitalData.data.hospital.id)

        // Fetch appointments
        await fetchAppointments(hospitalData.data.hospital.id)

        // Fetch emergency data
        await fetchEmergencyData(hospitalData.data.hospital.id)
      } else if (hospitalData.hospital) {
        // Fallback for old structure
        console.log("Setting hospital data (fallback):", hospitalData.hospital)
        setHospital(hospitalData.hospital)

        // Initialize emergency forms with current hospital data
        setEmergencyStatusForm({
          emergency_available: hospitalData.hospital.emergency_available || true,
          emergency_available_beds: hospitalData.hospital.emergency_available_beds || 0
        })
        setAmbulanceStatusForm({
          ambulance_available: hospitalData.hospital.ambulance_available || false
        })
        setTraumaCenterForm({
          trauma_center: hospitalData.hospital.trauma_center || false
        })

        // Fetch beds
        const { data: bedsData } = await supabase
          .from("hospital_beds")
          .select("*")
          .eq("hospital_id", hospitalData.hospital.id)
        setBeds(bedsData || [])

        // Fetch vaccines
        await fetchVaccines(hospitalData.hospital.id)

        // Fetch appointments
        await fetchAppointments(hospitalData.hospital.id)

        // Fetch emergency data
        await fetchEmergencyData(hospitalData.hospital.id)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVaccines = async (hospitalId) => {
    try {
      console.log("Fetching vaccines for hospital:", hospitalId)
      const response = await fetch(`/api/hospital/vaccines?hospitalId=${hospitalId}`)
      const data = await response.json()

      console.log("Vaccine API response:", data)

      if (response.ok && data.success && data.data && data.data.vaccines) {
        console.log("Setting vaccines:", data.data.vaccines)
        setVaccines(data.data.vaccines)
      } else if (response.ok && data.success && data.data && Array.isArray(data.data.vaccines) && data.data.vaccines.length === 0) {
        // Successfully fetched but no vaccines found
        console.log("No vaccines found for hospital")
        setVaccines([])
      } else {
        console.error("Error fetching vaccines:", data.error || "Unknown error")
        setVaccines([])
        if (!response.ok) {
          toast({
            title: "Error",
            description: data.error || "Failed to load vaccines",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error)
      setVaccines([])
      toast({
        title: "Error",
        description: "Failed to load vaccines",
        variant: "destructive"
      })
    }
  }

  const fetchAppointments = async (hospitalId) => {
    try {
      console.log("Fetching appointments for hospital:", hospitalId)
      const response = await fetch(`/api/hospital/appointments?hospitalId=${hospitalId}`)
      const data = await response.json()

      console.log("Appointments API response:", data)

      if (data.success && data.data && data.data.appointments) {
        console.log("Setting appointments:", data.data.appointments)
        setAppointments(data.data.appointments)
      } else {
        console.error("Error fetching appointments:", data.error)
        setAppointments([])
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    }
  }

  const fetchEmergencyData = async (hospitalId) => {
    try {
      // Fetch emergency stats
      const statsResponse = await fetch(`/api/hospital/emergency?hospitalId=${hospitalId}&type=stats`)
      const statsData = await statsResponse.json()
      setEmergencyStats(statsData.stats || { activeRequests: 0, inProgressRequests: 0, completedToday: 0 })

      // Fetch emergency requests
      const requestsResponse = await fetch(`/api/hospital/emergency?hospitalId=${hospitalId}&type=requests`)
      const requestsData = await requestsResponse.json()
      setEmergencyRequests(requestsData.requests || [])

      // Fetch emergency services
      const servicesResponse = await fetch(`/api/hospital/emergency?hospitalId=${hospitalId}&type=services`)
      const servicesData = await servicesResponse.json()
      setEmergencyServices(servicesData.services || [])
    } catch (error) {
      console.error("Error fetching emergency data:", error)
    }
  }

  const handleVaccineSubmit = async (e) => {
    e.preventDefault()

    try {
      const method = editingVaccine ? 'PUT' : 'POST'
      const url = '/api/hospital/vaccines'
      const body = editingVaccine
        ? {
          availabilityId: editingVaccine.vaccine_availability[0]?.id,
          available_doses: parseInt(vaccineForm.available_doses),
          price: parseFloat(vaccineForm.price)
        }
        : {
          ...vaccineForm,
          hospitalId: hospital.id,
          doses_required: parseInt(vaccineForm.doses_required),
          available_doses: parseInt(vaccineForm.available_doses),
          price: parseFloat(vaccineForm.price)
        }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        setIsVaccineDialogOpen(false)
        setEditingVaccine(null)
        resetVaccineForm()
        fetchVaccines(hospital.id)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save vaccine",
        variant: "destructive"
      })
    }
  }

  const handleVaccineDelete = async (availabilityId) => {
    if (!confirm("Are you sure you want to remove this vaccine?")) return

    try {
      const response = await fetch(`/api/hospital/vaccines?availabilityId=${availabilityId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        fetchVaccines(hospital.id)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vaccine",
        variant: "destructive"
      })
    }
  }

  const handleAppointmentUpdate = async (appointmentId, status, adminNotes = "") => {
    try {
      const response = await fetch('/api/hospital/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          status,
          adminNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        fetchAppointments(hospital.id)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive"
      })
    }
  }

  const handleEmergencyStatusUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/hospital/emergency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          type: 'emergency_status',
          data: emergencyStatusForm
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        setIsEmergencyStatusDialogOpen(false)

        // Update hospital state
        setHospital(prev => ({
          ...prev,
          emergency_available: emergencyStatusForm.emergency_available,
          emergency_available_beds: emergencyStatusForm.emergency_available_beds
        }))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update emergency status",
        variant: "destructive"
      })
    }
  }

  const handleAmbulanceStatusUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/hospital/emergency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          type: 'ambulance_status',
          data: ambulanceStatusForm
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        setIsAmbulanceStatusDialogOpen(false)

        // Update hospital state
        setHospital(prev => ({
          ...prev,
          ambulance_available: ambulanceStatusForm.ambulance_available
        }))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ambulance status",
        variant: "destructive"
      })
    }
  }

  const handleTraumaCenterUpdate = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/hospital/emergency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          type: 'trauma_center',
          data: traumaCenterForm
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        setIsTraumaCenterDialogOpen(false)

        // Update hospital state
        setHospital(prev => ({
          ...prev,
          trauma_center: traumaCenterForm.trauma_center
        }))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update trauma center status",
        variant: "destructive"
      })
    }
  }

  const resetVaccineForm = () => {
    setVaccineForm({
      name: "",
      manufacturer: "",
      description: "",
      age_group: "",
      doses_required: 1,
      available_doses: 0,
      price: 0
    })
  }

  const openEditVaccine = (vaccine) => {
    setEditingVaccine(vaccine)
    setVaccineForm({
      name: vaccine.name || "",
      manufacturer: vaccine.manufacturer || "",
      description: vaccine.description || "",
      age_group: vaccine.age_group || "",
      doses_required: vaccine.doses_required || 1,
      available_doses: vaccine.vaccine_availability?.[0]?.available_doses || 0,
      price: vaccine.vaccine_availability?.[0]?.price || 0
    })
    setIsVaccineDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const availableBeds = beds.filter((b) => b.status === "available").length
  const occupiedBeds = beds.filter((b) => b.status === "occupied").length
  const pendingAppointments = appointments.filter((a) => a.status === "scheduled").length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Hospital className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Hospital Dashboard</h1>
                <p className="text-sm text-muted-foreground">{hospital?.name || "Hospital"}</p>
              </div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{beds.length}</div>
                  <p className="text-xs text-muted-foreground">Total capacity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                  <Bed className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableBeds}</div>
                  <p className="text-xs text-muted-foreground">Ready for patients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
                  <Bed className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{occupiedBeds}</div>
                  <p className="text-xs text-muted-foreground">Currently in use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAppointments}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage hospital operations</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Button asChild className="w-full justify-start">
                    <Link href="/dashboard/hospital/beds">
                      <Bed className="mr-2 h-4 w-4" />
                      Manage Beds
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("vaccines")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Syringe className="mr-2 h-4 w-4" />
                    Manage Vaccines
                  </Button>
                  <Button
                    onClick={() => setActiveTab("appointments")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Appointments
                  </Button>
                  <Button
                    onClick={() => setActiveTab("settings")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Hospital Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hospital Info</CardTitle>
                  <CardDescription>Your hospital details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{hospital?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{hospital?.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{hospital?.city || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vaccines" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Vaccine Management</h2>
                <p className="text-muted-foreground">Manage your hospital's vaccine inventory</p>
              </div>
              <Dialog open={isVaccineDialogOpen} onOpenChange={setIsVaccineDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetVaccineForm(); setEditingVaccine(null); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vaccine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}</DialogTitle>
                    <DialogDescription>
                      {editingVaccine ? 'Update vaccine information' : 'Add a new vaccine to your inventory'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleVaccineSubmit} className="space-y-4">
                    {!editingVaccine && (
                      <>
                        <div>
                          <Label htmlFor="name">Vaccine Name</Label>
                          <Input
                            id="name"
                            value={vaccineForm.name}
                            onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="manufacturer">Manufacturer</Label>
                          <Input
                            id="manufacturer"
                            value={vaccineForm.manufacturer}
                            onChange={(e) => setVaccineForm({ ...vaccineForm, manufacturer: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={vaccineForm.description}
                            onChange={(e) => setVaccineForm({ ...vaccineForm, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="age_group">Age Group</Label>
                          <Input
                            id="age_group"
                            value={vaccineForm.age_group}
                            onChange={(e) => setVaccineForm({ ...vaccineForm, age_group: e.target.value })}
                            placeholder="e.g., 18+ years"
                          />
                        </div>
                        <div>
                          <Label htmlFor="doses_required">Doses Required</Label>
                          <Input
                            id="doses_required"
                            type="number"
                            min="1"
                            value={vaccineForm.doses_required}
                            onChange={(e) => setVaccineForm({ ...vaccineForm, doses_required: e.target.value })}
                            required
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="available_doses">Available Doses</Label>
                      <Input
                        id="available_doses"
                        type="number"
                        min="0"
                        value={vaccineForm.available_doses}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, available_doses: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price per Dose (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={vaccineForm.price}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsVaccineDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingVaccine ? 'Update' : 'Add'} Vaccine
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vaccines && vaccines.length > 0 ? vaccines.map((vaccine) => (
                <Card key={vaccine.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{vaccine.name || 'Unknown Vaccine'}</CardTitle>
                        <CardDescription>{vaccine.manufacturer || 'Unknown Manufacturer'}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditVaccine(vaccine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVaccineDelete(vaccine.vaccine_availability?.[0]?.id)}
                          disabled={!vaccine.vaccine_availability?.[0]?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Doses</p>
                      <p className="font-medium">{vaccine.vaccine_availability?.[0]?.available_doses || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Dose</p>
                      <p className="font-medium">₹{vaccine.vaccine_availability?.[0]?.price || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Doses Required</p>
                      <p className="font-medium">{vaccine.doses_required || 'N/A'}</p>
                    </div>
                    {vaccine.age_group && (
                      <div>
                        <p className="text-sm text-muted-foreground">Age Group</p>
                        <p className="font-medium">{vaccine.age_group}</p>
                      </div>
                    )}
                    <Badge
                      className={
                        (vaccine.vaccine_availability?.[0]?.available_doses || 0) > 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {(vaccine.vaccine_availability?.[0]?.available_doses || 0) > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                  </CardContent>
                </Card>
              )) : null}
            </div>

            {!vaccines || vaccines.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Syringe className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No vaccines available</h3>
                    <p className="text-muted-foreground">
                      {loading ? "Loading vaccines..." : "Add vaccines to your inventory to get started."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Appointment Management</h2>
                <p className="text-muted-foreground">Manage patient appointments</p>
              </div>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold">{appointment.users?.full_name || "Unknown Patient"}</p>
                          <p className="text-sm text-muted-foreground">{appointment.users?.email}</p>
                          <p className="text-sm text-muted-foreground">{appointment.users?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Appointment Date</p>
                          <p className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleString()}
                          </p>
                        </div>
                        {appointment.reason && (
                          <div>
                            <p className="text-sm text-muted-foreground">Reason</p>
                            <p className="font-medium">{appointment.reason}</p>
                          </div>
                        )}
                        {appointment.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground">Patient Notes</p>
                            <p className="font-medium">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={
                            appointment.status === "approved" ? "bg-green-500" :
                              appointment.status === "rejected" ? "bg-red-500" :
                                appointment.status === "scheduled" ? "bg-orange-500" :
                                  "bg-gray-500"
                          }
                        >
                          {appointment.status}
                        </Badge>
                        {appointment.status === "scheduled" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentUpdate(appointment.id, "approved")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentUpdate(appointment.id, "rejected")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {appointments.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No appointments</h3>
                    <p className="text-muted-foreground">No appointments have been scheduled yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergency" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-red-600" />
                    Emergency Services
                  </CardTitle>
                  <CardDescription>Manage emergency services and requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{emergencyStats.activeRequests}</div>
                          <div className="text-sm text-muted-foreground">Active Requests</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{emergencyStats.inProgressRequests}</div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{emergencyStats.completedToday}</div>
                          <div className="text-sm text-muted-foreground">Completed Today</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Emergency Features</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Dialog open={isEmergencyStatusDialogOpen} onOpenChange={setIsEmergencyStatusDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="justify-start h-auto p-4">
                            <div className="text-left">
                              <div className="font-medium">Emergency Bed Status</div>
                              <div className="text-sm text-muted-foreground">
                                View and update emergency bed availability
                              </div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Emergency Status</DialogTitle>
                            <DialogDescription>
                              Update your hospital's emergency service availability
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleEmergencyStatusUpdate} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="emergency_available"
                                checked={emergencyStatusForm.emergency_available}
                                onChange={(e) => setEmergencyStatusForm({
                                  ...emergencyStatusForm,
                                  emergency_available: e.target.checked
                                })}
                              />
                              <Label htmlFor="emergency_available">Emergency Services Available</Label>
                            </div>
                            <div>
                              <Label htmlFor="emergency_beds">Available Emergency Beds</Label>
                              <Input
                                id="emergency_beds"
                                type="number"
                                min="0"
                                value={emergencyStatusForm.emergency_available_beds}
                                onChange={(e) => setEmergencyStatusForm({
                                  ...emergencyStatusForm,
                                  emergency_available_beds: parseInt(e.target.value) || 0
                                })}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsEmergencyStatusDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Update Status</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isAmbulanceStatusDialogOpen} onOpenChange={setIsAmbulanceStatusDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="justify-start h-auto p-4">
                            <div className="text-left">
                              <div className="font-medium">Ambulance Requests</div>
                              <div className="text-sm text-muted-foreground">
                                Manage incoming ambulance requests
                              </div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Ambulance Status</DialogTitle>
                            <DialogDescription>
                              Update your hospital's ambulance service availability
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAmbulanceStatusUpdate} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="ambulance_available"
                                checked={ambulanceStatusForm.ambulance_available}
                                onChange={(e) => setAmbulanceStatusForm({
                                  ...ambulanceStatusForm,
                                  ambulance_available: e.target.checked
                                })}
                              />
                              <Label htmlFor="ambulance_available">Ambulance Service Available</Label>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsAmbulanceStatusDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Update Status</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isEmergencyContactsDialogOpen} onOpenChange={setIsEmergencyContactsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="justify-start h-auto p-4">
                            <div className="text-left">
                              <div className="font-medium">Emergency Contacts</div>
                              <div className="text-sm text-muted-foreground">
                                Manage emergency service contacts
                              </div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Emergency Contacts</DialogTitle>
                            <DialogDescription>
                              View and manage emergency service contacts
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Hospital Emergency</h4>
                              <p className="text-sm text-muted-foreground">Emergency Phone: {hospital?.phone || 'Not set'}</p>
                              <p className="text-sm text-muted-foreground">Operating Hours: {hospital?.emergency_hours || '24x7'}</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Emergency Status</h4>
                              <p className="text-sm text-muted-foreground">
                                Emergency Services: {hospital?.emergency_available ? 'Available' : 'Not Available'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Available Emergency Beds: {hospital?.emergency_available_beds || 0}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Ambulance Service: {hospital?.ambulance_available ? 'Available' : 'Not Available'}
                              </p>
                            </div>
                            <div className="flex justify-end">
                              <Button onClick={() => setIsEmergencyContactsDialogOpen(false)}>Close</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isTraumaCenterDialogOpen} onOpenChange={setIsTraumaCenterDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="justify-start h-auto p-4">
                            <div className="text-left">
                              <div className="font-medium">Trauma Center Status</div>
                              <div className="text-sm text-muted-foreground">
                                Update trauma center availability
                              </div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Trauma Center Status</DialogTitle>
                            <DialogDescription>
                              Update your hospital's trauma center designation
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleTraumaCenterUpdate} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="trauma_center"
                                checked={traumaCenterForm.trauma_center}
                                onChange={(e) => setTraumaCenterForm({
                                  ...traumaCenterForm,
                                  trauma_center: e.target.checked
                                })}
                              />
                              <Label htmlFor="trauma_center">Hospital is designated as Trauma Center</Label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Trauma centers are specialized hospitals equipped to handle severe medical emergencies.
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsTraumaCenterDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Update Status</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm">
                      <strong>Current Status:</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• Emergency Services: {hospital?.emergency_available ? 'Available' : 'Not Available'}</li>
                        <li>• Available Emergency Beds: {hospital?.emergency_available_beds || 0}</li>
                        <li>• Ambulance Service: {hospital?.ambulance_available ? 'Available' : 'Not Available'}</li>
                        <li>• Trauma Center: {hospital?.trauma_center ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hospital Information</CardTitle>
                  <CardDescription>Update your hospital details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hospital-name">Hospital Name</Label>
                    <Input id="hospital-name" value={hospital?.name || ""} disabled />
                  </div>
                  <div>
                    <Label htmlFor="hospital-phone">Phone</Label>
                    <Input id="hospital-phone" value={hospital?.phone || ""} disabled />
                  </div>
                  <div>
                    <Label htmlFor="hospital-address">Address</Label>
                    <Textarea id="hospital-address" value={hospital?.address || ""} disabled />
                  </div>
                  <div>
                    <Label htmlFor="hospital-city">City</Label>
                    <Input id="hospital-city" value={hospital?.city || ""} disabled />
                  </div>
                  <Button disabled>Update Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Hospital overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Vaccines</span>
                    <span className="font-semibold">{vaccines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Appointments</span>
                    <span className="font-semibold">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Approvals</span>
                    <span className="font-semibold">{pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bed Occupancy</span>
                    <span className="font-semibold">
                      {beds.length > 0 ? Math.round((occupiedBeds / beds.length) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
