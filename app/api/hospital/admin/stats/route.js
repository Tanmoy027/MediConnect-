import { hospitalController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/hospital/admin/stats
 * Get comprehensive hospital statistics for admin dashboard
 * Returns: beds, appointments, vaccines, summary stats
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

    // Get hospital for this admin
    const hospital = await hospitalController.getHospitalByAdmin(user.id)
    if (!hospital) {
      return NextResponse.json(BaseController.handleError(new Error("Hospital not found"), "Hospital not setup yet"), {
        status: 404,
      })
    }

    // Verify admin access
    await hospitalController.verifyHospitalAdmin(user.id, hospital.id)

    // Get hospital statistics
    const hospitalStats = await hospitalController.getHospitalStats(hospital.id)

    const stats = {
      hospital: hospitalStats,
      summary: {
        totalBeds: hospitalStats.beds.total,
        availableBeds: hospitalStats.beds.available,
        occupancyRate:
          hospitalStats.beds.total > 0 ? Math.round((hospitalStats.beds.occupied / hospitalStats.beds.total) * 100) : 0,
        pendingAppointments: hospitalStats.appointments.pending,
        totalAppointments: hospitalStats.appointments.total,
        totalVaccines: hospitalStats.vaccines.total,
        totalDoses: hospitalStats.vaccines.totalDoses,
      },
    }

    return NextResponse.json(BaseController.success(stats, "Hospital statistics retrieved successfully"), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in hospital stats GET:", error)
    const errorResponse = BaseController.handleError(error)
    const statusCode = error.message.includes("Access denied") ? 403 : 400
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
