import { hospitalController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/hospital
 * Get hospital for current admin
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

    console.log("Hospital API - Fetching hospital for user:", user.id)

    const hospital = await hospitalController.getHospitalByAdmin(user.id)

    console.log("Hospital API - Found hospital:", hospital)

    const response = BaseController.success(
      {
        hospital,
        needsSetup: !hospital,
      },
      "Hospital retrieved successfully",
    )

    console.log("Hospital API - Returning response:", response)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in hospital GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
