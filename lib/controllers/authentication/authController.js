import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Authentication Controller - Handles all authentication operations
 * Supports user registration, login, and role-based user creation
 */
export class AuthController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullName - User full name
   * @param {string} phone - User phone number
   * @param {string} role - User role (normal_user, hospital_admin, blood_bank_admin, etc.)
   */
  async registerUser(email, password, fullName, phone, role = "normal_user") {
    if (!this.supabase) await this.initialize()

    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    // Sign up the user with Supabase Auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
          phone: phone || null,
          role: role,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Registration failed - user not created")
    }

    // Create user record in users table using admin client
    try {
      const { error: insertError } = await this.supabaseAdmin.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || null,
        phone: phone || null,
        role: role,
        is_active: true,
      })

      if (insertError && !insertError.message.includes("duplicate")) {
        console.error("Error creating user record:", insertError)
      }
    } catch (dbError) {
      console.error("Error creating user record:", dbError)
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: role,
        full_name: fullName || null,
        phone: phone || null,
      },
      requiresEmailConfirmation: !data.session,
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async loginUser(email, password) {
    if (!this.supabase) await this.initialize()

    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    // Sign in the user
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Authentication failed")
    }

    // Get user role and additional info from users table
    try {
      const { data: userData, error: userError } = await this.supabaseAdmin
        .from("users")
        .select("role, full_name, phone, is_active")
        .eq("id", data.user.id)
        .single()

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user data:", userError)
      }

      // If user doesn't exist in users table, create a basic record
      if (!userData) {
        const { error: insertError } = await this.supabaseAdmin.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || null,
          phone: data.user.user_metadata?.phone || null,
          role: "normal_user",
          is_active: true,
        })

        if (insertError) {
          console.error("Error creating user record:", insertError)
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            role: "normal_user",
            full_name: data.user.user_metadata?.full_name || null,
            phone: data.user.user_metadata?.phone || null,
          },
        }
      }

      // Check if user is active
      if (!userData.is_active) {
        throw new Error("User account is inactive")
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userData.role,
          full_name: userData.full_name,
          phone: userData.phone,
        },
      }
    } catch (roleError) {
      console.error("Error getting user role:", roleError)
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: "normal_user",
          full_name: data.user.user_metadata?.full_name || null,
          phone: data.user.user_metadata?.phone || null,
        },
      }
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser() {
    if (!this.supabase) await this.initialize()

    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      throw new Error("No authenticated user")
    }

    return user
  }

  /**
   * Logout user
   */
  async logoutUser() {
    if (!this.supabase) await this.initialize()

    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    return true
  }
}

// Export singleton instance
export const authController = new AuthController()
