import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * PUT /api/blood-bank/admin/campaigns/[id]
 * Update campaign status
 * Requires: status
 */
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(BaseController.handleError(new Error("Unauthorized"), "Unauthorized"), { status: 401 })
    }

    const body = await request.json()
    const { id } = params

    // Validate required fields
    BaseController.validateRequired(body, ["status"])

    const campaign = await bloodBankController.updateCampaignStatus(user.id, id, body.status)

    return NextResponse.json(BaseController.success(campaign, "Campaign updated successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in campaign PUT:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
