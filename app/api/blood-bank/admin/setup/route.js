import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/blood-bank/admin/setup
 * Setup/create a new blood bank for blood bank admin
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

    // Create blood bank
    const bloodBank = await bloodBankController.createBloodBank(user.id, sanitizedData)

    return NextResponse.json(BaseController.success(bloodBank, "Blood bank setup completed successfully"), {
      status: 201,
    })
  } catch (error) {
    console.error("Error in blood bank setup POST:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}

/**
 * GET /api/blood-bank/admin/setup
 * Get current blood bank setup status
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

    const bloodBank = await bloodBankController.getBloodBankByAdmin(user.id)

    return NextResponse.json(
      BaseController.success(
        {
          bloodBank,
          needsSetup: !bloodBank,
        },
        "Blood bank setup status retrieved successfully",
      ),
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in blood bank setup GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
