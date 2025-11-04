import { hospitalController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/hospital/admin/setup
 * Setup/create a new hospital for hospital admin
 * Requires: name, phone, address, city, state, pincode
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(BaseController.handleError(new Error("Unauthorized"), "Unauthorized"), { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    BaseController.validateRequired(body, ["name", "phone", "address", "city", "state", "pincode"])

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    // Create hospital
    const hospital = await hospitalController.createHospital(user.id, sanitizedData)

    return NextResponse.json(BaseController.success(hospital, "Hospital setup completed successfully"), { status: 201 })
  } catch (error) {
    console.error("Error in hospital setup POST:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * GET /api/hospital/admin/setup
 * Get current hospital setup status
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

    return NextResponse.json(
      BaseController.success(
        {
          hospital,
          needsSetup: !hospital,
        },
        "Hospital setup status retrieved successfully",
      ),
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in hospital setup GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
