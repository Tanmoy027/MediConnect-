import { hospitalController, BaseController } from "@/lib/controllers"
import { NextResponse } from "next/server"

/**
 * GET /api/hospital/public/[id]
 * Get specific hospital details (public endpoint)
 * No authentication required
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        BaseController.handleError(new Error("Hospital ID is required"), "Hospital ID is required"),
        { status: 400 },
      )
    }

    const hospital = await hospitalController.getHospitalById(id)

    return NextResponse.json(BaseController.success(hospital, "Hospital details retrieved successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in hospital details GET:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("not found") ? 404 : 500
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
