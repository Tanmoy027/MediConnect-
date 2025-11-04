import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Hospital Controller - Handles all hospital admin related operations
 * Manages hospital creation, updates, statistics, and admin verification
 */
export class HospitalController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Verify if user is hospital admin and has access to hospital
   * @param {string} userId - User ID to verify
   * @param {string} hospitalId - Optional: specific hospital ID to check access
   */
  async verifyHospitalAdmin(userId, hospitalId = null) {
    if (!this.supabaseAdmin) await this.initialize()

    // Check user role
    const { data: profile, error: profileError } = await this.supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError || !profile || profile.role !== "hospital_admin") {
      throw new Error("Access denied: Not a hospital admin")
    }

    // If hospitalId provided, verify admin has access to this hospital
    if (hospitalId) {
      const { data: hospital, error: hospitalError } = await this.supabaseAdmin
        .from("hospitals")
        .select("admin_id")
        .eq("id", hospitalId)
        .single()

      if (hospitalError || !hospital || hospital.admin_id !== userId) {
        throw new Error("Access denied: Not authorized for this hospital")
      }
    }

    return true
  }

  /**
   * Get hospital by admin ID
   * @param {string} adminId - Admin user ID
   */
  async getHospitalByAdmin(adminId) {
    if (!this.supabase) await this.initialize()

    const { data: hospitals, error } = await this.supabase
      .from("hospitals")
      .select("*")
      .eq("admin_id", adminId)
      .eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch hospital: ${error.message}`)
    }

    return hospitals?.[0] || null
  }

  /**
   * Create new hospital
   * @param {string} adminId - Admin user ID
   * @param {object} hospitalData - Hospital data to create
   */
  async createHospital(adminId, hospitalData) {
    if (!this.supabase) await this.initialize()

    await this.verifyHospitalAdmin(adminId)

    const insertData = {
      admin_id: adminId,
      name: hospitalData.name,
      phone: hospitalData.phone,
      address: hospitalData.address,
      city: hospitalData.city,
      state: hospitalData.state,
      pincode: hospitalData.pincode,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...hospitalData,
    }

    const { data: hospital, error } = await this.supabase.from("hospitals").insert(insertData).select().single()

    if (error) {
      throw new Error(`Failed to create hospital: ${error.message}`)
    }

    return hospital
  }

  /**
   * Update hospital information
   * @param {string} adminId - Admin user ID
   * @param {string} hospitalId - Hospital ID to update
   * @param {object} updateData - Data to update
   */
  async updateHospital(adminId, hospitalId, updateData) {
    if (!this.supabase) await this.initialize()

    await this.verifyHospitalAdmin(adminId, hospitalId)

    const { data: hospital, error } = await this.supabase
      .from("hospitals")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospitalId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update hospital: ${error.message}`)
    }

    return hospital
  }

  /**
   * Get hospital statistics (beds, appointments, vaccines)
   * @param {string} hospitalId - Hospital ID
   */
  async getHospitalStats(hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    // Get bed statistics
    const { data: beds } = await this.supabaseAdmin.from("hospital_beds").select("status").eq("hospital_id", hospitalId)

    // Get appointment statistics
    const { data: appointments } = await this.supabaseAdmin
      .from("appointments")
      .select("status")
      .eq("hospital_id", hospitalId)

    // Get vaccine statistics
    const { data: vaccines } = await this.supabaseAdmin
      .from("vaccine_availability")
      .select("available_doses")
      .eq("hospital_id", hospitalId)

    const stats = {
      beds: {
        total: beds?.length || 0,
        available: beds?.filter((b) => b.status === "available").length || 0,
        occupied: beds?.filter((b) => b.status === "occupied").length || 0,
      },
      appointments: {
        total: appointments?.length || 0,
        pending: appointments?.filter((a) => a.status === "scheduled").length || 0,
        approved: appointments?.filter((a) => a.status === "approved").length || 0,
        completed: appointments?.filter((a) => a.status === "completed").length || 0,
      },
      vaccines: {
        total: vaccines?.length || 0,
        totalDoses: vaccines?.reduce((sum, v) => sum + (v.available_doses || 0), 0) || 0,
      },
    }

    return stats
  }

  /**
   * Get all active hospitals (public)
   */
  async getAllHospitals() {
    if (!this.supabase) await this.initialize()

    const { data: hospitals, error } = await this.supabase
      .from("hospitals")
      .select("id, name, phone, address, city, state, pincode")
      .eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch hospitals: ${error.message}`)
    }

    return hospitals || []
  }

  /**
   * Get specific hospital by ID
   * @param {string} hospitalId - Hospital ID
   */
  async getHospitalById(hospitalId) {
    if (!this.supabase) await this.initialize()

    const { data: hospital, error } = await this.supabase
      .from("hospitals")
      .select("*")
      .eq("id", hospitalId)
      .eq("is_active", true)
      .single()

    if (error || !hospital) {
      throw new Error("Hospital not found")
    }

    return hospital
  }
}

// Export singleton instance
export const hospitalController = new HospitalController()
