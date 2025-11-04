import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/blood-bank/admin/stats
 * Get blood bank statistics
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

    const stats = await bloodBankController.getBloodBankStats(bloodBank.id)

    return NextResponse.json(BaseController.success(stats, "Statistics retrieved successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in stats GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
