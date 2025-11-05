import { appointmentController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get("hospitalId")
    const status = searchParams.get("status")

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filters = {}
    if (status) filters.status = status

    const appointments = await appointmentController.getAppointments(hospitalId, filters)

    return NextResponse.json(BaseController.success({ appointments }, "Appointments retrieved successfully"))
  } catch (error) {
    console.error("Error in hospital appointments GET:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    BaseController.validateRequired(body, ["hospitalId", "appointment_date", "reason"])

    // Sanitize input
    const sanitizedData = BaseController.sanitizeInput(body)

    const appointment = await appointmentController.createAppointment(user.id, body.hospitalId, sanitizedData)

    return NextResponse.json(BaseController.success(appointment, "Appointment created successfully"), { status: 201 })
  } catch (error) {
    console.error("Error in hospital appointments POST:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, status, adminNotes } = body

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    const appointment = await appointmentController.updateAppointmentStatus(
      appointmentId,
      status || "scheduled",
      adminNotes || "",
    )

    return NextResponse.json(BaseController.success(appointment, `Appointment ${status || "updated"} successfully`))
  } catch (error) {
    console.error("Error in hospital appointments PUT:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await appointmentController.cancelAppointment(appointmentId)

    return NextResponse.json(BaseController.success(null, "Appointment cancelled successfully"))
  } catch (error) {
    console.error("Error in hospital appointments DELETE:", error)
    const errorResponse = BaseController.handleError(error)
    return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
  }
}
