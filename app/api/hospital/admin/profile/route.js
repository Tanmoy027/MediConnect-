import { hospitalController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/hospital/admin/profile
 * Get hospital admin's hospital profile
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(BaseController.handleError(new Error("Unauthorized"), "Unauthorized"), { status: 401 })
    }

    const hospital = await hospitalController.getHospitalByAdmin(user.id)

    if (!hospital) {
      return NextResponse.json(BaseController.handleError(new Error("Hospital not found"), "Hospital not found"), {
        status: 404,
      })
    }

    return NextResponse.json(BaseController.success(hospital, "Hospital profile retrieved successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in hospital profile GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}

/**
 * PUT /api/hospital/admin/profile
 * Update hospital admin's hospital profile
 */
export async function PUT(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(BaseController.handleError(new Error("Unauthorized"), "Unauthorized"), { status: 401 })
    }

    const body = await request.json()

    // Get current hospital first
    const currentHospital = await hospitalController.getHospitalByAdmin(user.id)
    if (!currentHospital) {
      return NextResponse.json(BaseController.handleError(new Error("Hospital not found"), "Hospital not found"), {
        status: 404,
      })
    }

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    // Update hospital
    const hospital = await hospitalController.updateHospital(user.id, currentHospital.id, sanitizedData)

    return NextResponse.json(BaseController.success(hospital, "Hospital profile updated successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in hospital profile PUT:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
