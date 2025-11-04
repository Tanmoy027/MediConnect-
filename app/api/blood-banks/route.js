import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/blood-banks
 * Get list of blood banks with optional filtering
 * Query parameters:
 * - city: Filter by city
 * - bloodType: Filter by blood type availability
 */
export async function GET(request) {
    try {
        console.log("🔍 Blood bank search API called")

        const { searchParams } = new URL(request.url)
        const city = searchParams.get("city")
        const bloodType = searchParams.get("bloodType")

        console.log("🔍 Search params:", { city, bloodType })

        const supabase = await createClient()        // First, let's check what blood banks exist in the database
        const { data: allBloodBanks, error: allError } = await supabase
            .from("blood_banks")
            .select("id, name, city, state, is_verified, is_active")
            .limit(20)

        console.log("🏥 All blood banks in database:", allBloodBanks)
        console.log("🏥 Total blood banks found:", allBloodBanks?.length || 0)
        console.log("🏥 Available cities:", allBloodBanks?.map(bb => bb.city).join(", "))

        // Build query
        let query = supabase
            .from("blood_banks")
            .select("*")

        console.log("🔍 Base query created")

        // Apply city filter if provided
        if (city && city.trim() !== "") {
            query = query.ilike("city", `%${city}%`)
            console.log("🏥 Filtering by city (case-insensitive, partial match):", city)
        }        // Apply active filter (keep verified filter optional to show more results)
        query = query.eq("is_active", true)
        console.log("🔍 Added active filter (including unverified blood banks for testing)")

        // If blood type filter is provided, we need to join with inventory
        if (bloodType && bloodType.trim() !== "") {
            // For now, we'll implement this as a simple filter
            // In a real implementation, you might want to join with blood_inventory table
            console.log("🩸 Blood type filter requested:", bloodType)
        }

        const { data: bloodBanks, error } = await query

        if (error) {
            console.error("❌ Database error:", error)
            return NextResponse.json(
                { error: "Failed to fetch blood banks", details: error.message },
                { status: 500 }
            )
        }

        console.log("✅ Found blood banks:", bloodBanks?.length || 0)
        console.log("🏥 Full blood bank data:", bloodBanks?.map(bb => ({
            id: bb.id,
            name: bb.name,
            city: bb.city,
            is_verified: bb.is_verified,
            is_active: bb.is_active
        })))

        return NextResponse.json(
            {
                bloodBanks: bloodBanks || [],
                count: bloodBanks?.length || 0,
                filters: { city, bloodType }
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
