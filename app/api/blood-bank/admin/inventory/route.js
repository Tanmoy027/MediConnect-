import { bloodBankController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/blood-bank/admin/inventory
 * Get blood bank inventory
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

    const inventory = await bloodBankController.getInventory(bloodBank.id)

    return NextResponse.json(BaseController.success(inventory, "Inventory retrieved successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in inventory GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}

/**
 * POST /api/blood-bank/admin/inventory
 * Add blood stock to inventory
 * Requires: bloodType, units
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
    BaseController.validateRequired(body, ["bloodType", "units"])

    const bloodBank = await bloodBankController.getBloodBankByAdmin(user.id)
    if (!bloodBank) {
      return NextResponse.json(BaseController.handleError(new Error("Blood bank not found"), "Blood bank not found"), {
        status: 404,
      })
    }

    const updated = await bloodBankController.addBloodStock(bloodBank.id, body.bloodType, body.units)

    return NextResponse.json(BaseController.success(updated, "Blood stock added successfully"), { status: 200 })
  } catch (error) {
    console.error("Error in inventory POST:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
