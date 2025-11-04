import { vaccineController, hospitalController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get("hospitalId")

    console.log("Vaccines API - Hospital ID:", hospitalId)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("Vaccines API - No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Vaccines API - User ID:", user.id)

    if (!hospitalId) {
      console.log("Vaccines API - No hospital ID provided")
      return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 })
    }

    const vaccines = await vaccineController.getVaccinesForHospital(hospitalId)

    console.log("Vaccines API - Retrieved vaccines:", vaccines)

    return NextResponse.json(BaseController.success({ vaccines }, "Vaccines retrieved successfully"))
  } catch (error) {
    console.error("Error in hospital vaccines GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    BaseController.validateRequired(body, ["name", "manufacturer", "hospitalId"])

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    console.log("Creating vaccine with data:", sanitizedData)

    const vaccine = await vaccineController.createVaccine(sanitizedData)
    const availability = await vaccineController.addVaccineToHospital(vaccine.id, body.hospitalId, {
      available_doses: body.available_doses || 0,
      price: body.price || 0,
    })

    console.log("Created vaccine and availability:", { vaccine, availability })

    return NextResponse.json(BaseController.success({ vaccine, availability }, "Vaccine added successfully"), {
      status: 201,
    })
  } catch (error) {
    console.error("Error in hospital vaccines POST:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { availabilityId, available_doses, price } = body

    if (!availabilityId) {
      return NextResponse.json({ error: "Availability ID is required" }, { status: 400 })
    }

    // Validate required fields
    BaseController.validateRequired({ available_doses, price }, ["available_doses", "price"])

    const availability = await vaccineController.updateVaccineAvailability(availabilityId, {
      available_doses,
      price,
    })

    return NextResponse.json(BaseController.success(availability, "Vaccine updated successfully"))
  } catch (error) {
    console.error("Error in hospital vaccines PUT:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const availabilityId = searchParams.get("availabilityId")

    if (!availabilityId) {
      return NextResponse.json({ error: "Availability ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await vaccineController.removeVaccineFromHospital(availabilityId)

    return NextResponse.json(BaseController.success(null, "Vaccine removed successfully"))
  } catch (error) {
    console.error("Error in hospital vaccines DELETE:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}
