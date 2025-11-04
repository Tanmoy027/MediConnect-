import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/hospitals
 * Get list of hospitals with optional filtering
 * Query parameters:
 * - city: Filter by city
 * - service: Filter by service (future use)
 */
export async function GET(request) {
    try {
        console.log("🔍 Hospital search API called")

        const { searchParams } = new URL(request.url)
        const city = searchParams.get("city")
        const service = searchParams.get("service")

        console.log("🔍 Search params:", { city, service })

        const supabase = await getSupabaseServerClient()

        // First, let's check what hospitals exist in the database
        const { data: allHospitals, error: allError } = await supabase
            .from("hospitals")
            .select("id, name, city, state, is_verified, is_active")
            .limit(10)

        console.log("🏥 All hospitals in database:", allHospitals)
        console.log("🏥 Total hospitals found:", allHospitals?.length || 0)

        // Build query
        let query = supabase
            .from("hospitals")
            .select("*")

        console.log("🔍 Base query created")        // Apply city filter if provided
        if (city && city.trim() !== "") {
            query = query.ilike("city", `%${city}%`)
            console.log("🏥 Filtering by city (case-insensitive, partial match):", city)
        }        // Apply active/verified filters
        query = query.eq("is_active", true)
        console.log("🔍 Added active filter (removed is_verified filter for now)")

        // Apply service filter if provided (future implementation)
        if (service && service.trim() !== "") {
            // TODO: Implement service filtering when services table is available
            console.log("🔧 Service filter requested (not implemented):", service)
        }

        const { data: hospitals, error } = await query

        if (error) {
            console.error("❌ Database error:", error)
            return NextResponse.json(
                { error: "Failed to fetch hospitals", details: error.message },
                { status: 500 }
            )
        }        console.log("✅ Found hospitals:", hospitals?.length || 0)
        console.log("🏥 Full hospital data:", hospitals?.map(h => ({ 
            id: h.id, 
            name: h.name, 
            city: h.city,
            emergency_available: h.emergency_available,
            ambulance_available: h.ambulance_available,
            trauma_center: h.trauma_center,
            is_verified: h.is_verified
        })))

        return NextResponse.json(
            {
                hospitals: hospitals || [],
                count: hospitals?.length || 0,
                filters: { city, service }
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("❌ API error:", error)
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        )
    }
}
