import { emergencyController, BaseController } from "@/lib/controllers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const hospitalId = searchParams.get('hospitalId')
        const type = searchParams.get('type')

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!hospitalId) {
            return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 })
        }

        switch (type) {
            case 'stats':
                const stats = await emergencyController.getEmergencyStats(user.id, hospitalId)
                return NextResponse.json({ stats })

            case 'requests':
                const requests = await emergencyController.getEmergencyRequests(user.id, hospitalId)
                return NextResponse.json({ requests })

            case 'services':
                const services = await emergencyController.getEmergencyServices(user.id, hospitalId)
                return NextResponse.json({ services })

            case 'info':
                const info = await emergencyController.getHospitalEmergencyInfo(user.id, hospitalId)
                return NextResponse.json({ info })

            default:
                return NextResponse.json({ error: "Invalid request type. Use 'stats', 'requests', 'services', or 'info'" }, { status: 400 })
        }
    } catch (error) {
        console.error("Error in hospital emergency GET:", error)
        const errorResponse = BaseController.handleError(error)
        return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { hospitalId, type, data: updateData } = body

        if (!hospitalId || !type || !updateData) {
            return NextResponse.json({ error: "Hospital ID, type, and data are required" }, { status: 400 })
        }

        // Sanitize input
        const sanitizedData = BaseController.sanitizeInput(updateData)

        let result
        switch (type) {
            case 'emergency_status':
                BaseController.validateRequired(sanitizedData, ['emergency_available', 'emergency_available_beds'])
                result = await emergencyController.updateEmergencyStatus(user.id, hospitalId, sanitizedData)
                break

            case 'ambulance_status':
                BaseController.validateRequired(sanitizedData, ['ambulance_available'])
                result = await emergencyController.updateAmbulanceStatus(user.id, hospitalId, sanitizedData)
                break

            case 'trauma_center':
                BaseController.validateRequired(sanitizedData, ['trauma_center'])
                result = await emergencyController.updateTraumaCenterStatus(user.id, hospitalId, sanitizedData)
                break

            default:
                return NextResponse.json({ error: "Invalid update type. Use 'emergency_status', 'ambulance_status', or 'trauma_center'" }, { status: 400 })
        }

        return NextResponse.json(BaseController.success(result, result.message))
    } catch (error) {
        console.error("Error in hospital emergency PUT:", error)
        const errorResponse = BaseController.handleError(error)
        return NextResponse.json(errorResponse, { status: error.message.includes("Access denied") ? 403 : 500 })
    }
}
