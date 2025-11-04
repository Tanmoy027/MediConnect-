import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/blood-bank/admin/profile
 * Get blood bank admin's blood bank profile
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

    if (!bloodBank) {
      return NextResponse.json(BaseController.handleError(new Error("Blood bank not found"), "Blood bank not found"), {
        status: 404,
      })
    }

    return NextResponse.json(BaseController.success(bloodBank, "Blood bank profile retrieved successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in blood bank profile GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}

/**
 * PUT /api/blood-bank/admin/profile
 * Update blood bank admin's blood bank profile
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

    // Get current blood bank first
    const currentBloodBank = await bloodBankController.getBloodBankByAdmin(user.id)
    if (!currentBloodBank) {
      return NextResponse.json(BaseController.handleError(new Error("Blood bank not found"), "Blood bank not found"), {
        status: 404,
      })
    }

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    // Update blood bank
    const bloodBank = await bloodBankController.updateBloodBank(user.id, currentBloodBank.id, sanitizedData)

    return NextResponse.json(BaseController.success(bloodBank, "Blood bank profile updated successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in blood bank profile PUT:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
