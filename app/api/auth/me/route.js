import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { BaseController } from "@/lib/controllers"

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request) {
  try {
    const supabase = await createClient()

    // Get current user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(BaseController.handleError(new Error("Not authenticated"), "Not authenticated"), {
        status: 401,
      })
    }

    // Get user role and details using admin client
    try {
      const supabaseAdmin = createAdminClient()
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("role, full_name, phone, is_active")
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        return NextResponse.json(
          BaseController.success({
            id: user.id,
            email: user.email,
            role: "normal_user",
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            is_active: true,
          }),
          { status: 200 },
        )
      }

      // Check if user is active
      if (!userData.is_active) {
        return NextResponse.json(
          BaseController.handleError(new Error("User account is inactive"), "User account is inactive"),
          { status: 403 },
        )
      }

      return NextResponse.json(
        BaseController.success({
          id: user.id,
          email: user.email,
          role: userData.role,
          full_name: userData.full_name,
          phone: userData.phone,
          is_active: userData.is_active,
        }),
        { status: 200 },
      )
    } catch (roleError) {
      console.error("Error getting user details:", roleError)
      return NextResponse.json(
        BaseController.success({
          id: user.id,
          email: user.email,
          role: "normal_user",
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
        }),
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in me API:", error)
    const errorResponse = BaseController.handleError(error, "Internal server error")
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
