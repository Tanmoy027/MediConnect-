import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { hospitalController } from "./hospitalController"

/**
 * Emergency Controller - Handles emergency operations for hospital admin
 */
export class EmergencyController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Get emergency statistics for hospital
   */
  async getEmergencyStats(adminId, hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    await hospitalController.verifyHospitalAdmin(adminId, hospitalId)

    // Get hospital location for area-based queries
    const { data: hospital } = await this.supabaseAdmin
      .from("hospitals")
      .select("city, state")
      .eq("id", hospitalId)
      .single()

    if (!hospital) {
      throw new Error("Hospital not found")
    }

    // Since emergency_requests table doesn't exist yet, return default stats
    // This prevents the application from crashing
    const activeRequests = []
    const inProgressRequests = []
    const completedToday = []

    if (false) { // Disabled until table exists
      // Get active requests in hospital area
      const { data: activeRequests } = await this.supabaseAdmin
        .from("emergency_requests")
        .select("id")
        .eq("status", "active")
        .or(`location_address.ilike.%${hospital.city}%,location_address.ilike.%${hospital.state}%`)

      // Get in-progress requests
      const { data: inProgressRequests } = await this.supabaseAdmin
        .from("emergency_requests")
        .select("id")
        .eq("status", "in_progress")
        .or(`location_address.ilike.%${hospital.city}%,location_address.ilike.%${hospital.state}%`)

      // Get completed requests today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: completedToday } = await this.supabaseAdmin
        .from("emergency_requests")
        .select("id")
        .eq("status", "completed")
        .gte("completion_time", today.toISOString())
        .or(`location_address.ilike.%${hospital.city}%,location_address.ilike.%${hospital.state}%`)
    }

    return {
      activeRequests: activeRequests?.length || 0,
      inProgressRequests: inProgressRequests?.length || 0,
      completedToday: completedToday?.length || 0,
    }
  }

  /**
   * Get emergency requests for hospital area
   */
  async getEmergencyRequests(adminId, hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    try {
      await hospitalController.verifyHospitalAdmin(adminId, hospitalId)
    } catch (error) {
      throw error
    }

    // Since emergency_requests table doesn't exist yet, return empty array
    // This prevents the application from crashing
    console.log("Emergency requests table not implemented yet, returning empty array")
    return []
  }

  /**
   * Get emergency services in hospital area
   */
  async getEmergencyServices(adminId, hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    try {
      await hospitalController.verifyHospitalAdmin(adminId, hospitalId)
    } catch (error) {
      throw error
    }

    // Since emergency_services table doesn't exist yet, return empty array
    // This prevents the application from crashing
    console.log("Emergency services table not implemented yet, returning empty array")
    return []
  }

  /**
   * Update hospital emergency status
   */
  async updateEmergencyStatus(adminId, hospitalId, statusData) {
    if (!this.supabase) await this.initialize()

    await hospitalController.verifyHospitalAdmin(adminId, hospitalId)

    const { error } = await this.supabase
      .from("hospitals")
      .update({
        emergency_available: statusData.emergency_available,
        emergency_available_beds: statusData.emergency_available_beds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospitalId)

    if (error) {
      throw new Error(`Failed to update emergency status: ${error.message}`)
    }

    return { success: true, message: "Emergency status updated successfully" }
  }

  /**
   * Update hospital ambulance status
   */
  async updateAmbulanceStatus(adminId, hospitalId, statusData) {
    if (!this.supabase) await this.initialize()

    await hospitalController.verifyHospitalAdmin(adminId, hospitalId)

    const { error } = await this.supabase
      .from("hospitals")
      .update({
        ambulance_available: statusData.ambulance_available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospitalId)

    if (error) {
      throw new Error(`Failed to update ambulance status: ${error.message}`)
    }

    return { success: true, message: "Ambulance status updated successfully" }
  }

  /**
   * Update trauma center status
   */
  async updateTraumaCenterStatus(adminId, hospitalId, statusData) {
    if (!this.supabase) await this.initialize()

    await hospitalController.verifyHospitalAdmin(adminId, hospitalId)

    const { error } = await this.supabase
      .from("hospitals")
      .update({
        trauma_center: statusData.trauma_center,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospitalId)

    if (error) {
      throw new Error(`Failed to update trauma center status: ${error.message}`)
    }

    return { success: true, message: "Trauma center status updated successfully" }
  }

  /**
   * Get hospital emergency info
   */
  async getHospitalEmergencyInfo(adminId, hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    await hospitalController.verifyHospitalAdmin(adminId, hospitalId)

    const { data: hospital, error } = await this.supabaseAdmin
      .from("hospitals")
      .select(`
        emergency_available,
        emergency_available_beds,
        ambulance_available,
        trauma_center,
        emergency_hours,
        phone
      `)
      .eq("id", hospitalId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch hospital emergency info: ${error.message}`)
    }

    return hospital
  }
}

// Export singleton instance
export const emergencyController = new EmergencyController()
