import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/blood-bank/admin/campaigns
 * Get all campaigns for blood bank
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

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const campaigns = await bloodBankController.getCampaigns(bloodBank.id, status)

    return NextResponse.json(BaseController.success(campaigns, "Campaigns retrieved successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in campaigns GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}

/**
 * POST /api/blood-bank/admin/campaigns
 * Create new campaign
 * Requires: title, venue, address, city, state, startDate, endDate
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
    BaseController.validateRequired(body, ["title", "venue", "address", "city", "state", "startDate", "endDate"])

    const bloodBank = await bloodBankController.getBloodBankByAdmin(user.id)
    if (!bloodBank) {
      return NextResponse.json(BaseController.handleError(new Error("Blood bank not found"), "Blood bank not found"), {
        status: 404,
      })
    }

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    const campaign = await bloodBankController.createCampaign(user.id, bloodBank.id, sanitizedData)

    return NextResponse.json(BaseController.success(campaign, "Campaign created successfully"), { status: 201 })
  } catch (error) {
    console.error("Error in campaigns POST:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
