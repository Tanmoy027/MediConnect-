import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { BaseController } from "@/lib/controllers"

/**
 * POST /api/auth/logout
 * Logout the current user
 */
export async function POST(request) {
  try {
    const supabase = await createClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(BaseController.handleError(error, error.message), { status: 400 })
    }

    return NextResponse.json(BaseController.success(null, "Logout successful"), { status: 200 })
  } catch (error) {
    console.error("Error in logout API:", error)
    const errorResponse = BaseController.handleError(error, "Internal server error")
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
