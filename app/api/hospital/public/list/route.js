import { hospitalController, BaseController } from "@/lib/controllers"
import { NextResponse } from "next/server"

/**
 * GET /api/hospital/public/list
 * Get list of all active hospitals (public endpoint)
 * No authentication required
 */
export async function GET(request) {
  try {
    const hospitals = await hospitalController.getAllHospitals()

    return NextResponse.json(BaseController.success(hospitals, "Hospitals list retrieved successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in hospitals list GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
