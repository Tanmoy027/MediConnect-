import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth error:", error)
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    // If user is authenticated, ensure they exist in the users table
    if (data?.user) {
      try {
        // Use admin client to bypass RLS for user creation
        const adminSupabase = createAdminClient()

        // Check if user exists in users table
        const { data: existingUser, error: selectError } = await adminSupabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (selectError && selectError.code !== 'PGRST116') {
          console.error("Error checking user existence:", selectError)
        }

        if (!existingUser) {
          // Create user record if it doesn't exist
          const { error: insertError } = await adminSupabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || null,
              phone: data.user.user_metadata?.phone || null,
              role: data.user.user_metadata?.role || 'normal_user'
            })

          if (insertError) {
            console.error("Error creating user record:", insertError)
            // Don't fail the redirect, just log the error
          }
        }
      } catch (err) {
        console.error("Error handling user record:", err)
        // Don't fail the redirect, just log the error
      }
    }
  }

  // Redirect to dashboard after email verification
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}
