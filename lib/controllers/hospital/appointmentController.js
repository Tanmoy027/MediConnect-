import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Appointment Controller - Handles appointment operations for hospitals
 */
export class AppointmentController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Get all appointments for a hospital
   * @param {string} hospitalId - Hospital ID
   * @param {object} filters - Optional filters (status, user_id, etc)
   */
  async getAppointments(hospitalId, filters = {}) {
    if (!this.supabaseAdmin) await this.initialize()

    let query = this.supabaseAdmin
      .from("appointments")
      .select("*, users(full_name, email, phone)")
      .eq("hospital_id", hospitalId)

    // Apply filters
    if (filters.status) query = query.eq("status", filters.status)
    if (filters.user_id) query = query.eq("user_id", filters.user_id)

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch appointments: ${error.message}`)
    return data || []
  }

  /**
   * Create new appointment
   * @param {string} userId - User ID
   * @param {string} hospitalId - Hospital ID
   * @param {object} appointmentData - Appointment details
   */
  async createAppointment(userId, hospitalId, appointmentData) {
    if (!this.supabase) await this.initialize()

    const { data, error } = await this.supabase
      .from("appointments")
      .insert({
        user_id: userId,
        hospital_id: hospitalId,
        appointment_date: appointmentData.appointment_date,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create appointment: ${error.message}`)
    return data
  }

  /**
   * Update appointment status
   * @param {string} appointmentId - Appointment ID
   * @param {string} status - New status
   * @param {string} adminNotes - Optional admin notes
   */
  async updateAppointmentStatus(appointmentId, status, adminNotes = "") {
    if (!this.supabaseAdmin) await this.initialize()

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes) updateData.admin_notes = adminNotes

    const { data, error } = await this.supabaseAdmin
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update appointment: ${error.message}`)
    return data
  }

  /**
   * Cancel appointment
   * @param {string} appointmentId - Appointment ID
   */
  async cancelAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, "cancelled")
  }

  /**
   * Get appointment statistics for hospital
   * @param {string} hospitalId - Hospital ID
   */
  async getAppointmentStats(hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    const { data, error } = await this.supabaseAdmin.from("appointments").select("status").eq("hospital_id", hospitalId)

    if (error) throw new Error(`Failed to fetch stats: ${error.message}`)

    return {
      total: data?.length || 0,
      pending: data?.filter((a) => a.status === "scheduled").length || 0,
      approved: data?.filter((a) => a.status === "approved").length || 0,
      completed: data?.filter((a) => a.status === "completed").length || 0,
      cancelled: data?.filter((a) => a.status === "cancelled").length || 0,
    }
  }
}

export const appointmentController = new AppointmentController()
