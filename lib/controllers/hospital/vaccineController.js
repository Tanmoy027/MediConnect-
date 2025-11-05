import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Vaccine Controller - Handles vaccine inventory and management
 */
export class VaccineController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Create new vaccine
   * @param {object} vaccineData - Vaccine information
   */
  async createVaccine(vaccineData) {
    if (!this.supabaseAdmin) await this.initialize()

    const { data, error } = await this.supabaseAdmin
      .from("vaccines")
      .insert({
        name: vaccineData.name,
        manufacturer: vaccineData.manufacturer,
        description: vaccineData.description,
        age_group: vaccineData.age_group,
        doses_required: vaccineData.doses_required || 1,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create vaccine: ${error.message}`)
    return data
  }

  /**
   * Add vaccine to hospital inventory
   * @param {string} vaccineId - Vaccine ID
   * @param {string} hospitalId - Hospital ID
   * @param {object} availabilityData - Availability details
   */
  async addVaccineToHospital(vaccineId, hospitalId, availabilityData) {
    if (!this.supabase) await this.initialize()

    const { data, error } = await this.supabase
      .from("vaccine_availability")
      .insert({
        vaccine_id: vaccineId,
        hospital_id: hospitalId,
        available_doses: availabilityData.available_doses || 0,
        price: availabilityData.price || 0,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to add vaccine to hospital: ${error.message}`)
    return data
  }

  /**
   * Get all vaccines for hospital
   * @param {string} hospitalId - Hospital ID
   */
  async getVaccinesForHospital(hospitalId) {
    if (!this.supabase) await this.initialize()

    console.log("Fetching vaccines for hospital:", hospitalId)

    // Try with simplified query first to check if tables exist
    const { data, error } = await this.supabase
      .from("vaccine_availability")
      .select(`
        id,
        available_doses,
        price,
        vaccines!inner (
          id,
          name,
          manufacturer,
          description,
          age_group,
          doses_required
        )
      `)
      .eq("hospital_id", hospitalId)

    if (error) {
      console.error("Database error fetching vaccines:", error)

      // If the error is about missing columns, try with a more basic query
      if (error.message.includes("does not exist")) {
        console.log("Trying basic query without optional columns")
        const { data: basicData, error: basicError } = await this.supabase
          .from("vaccine_availability")
          .select(`
            id,
            available_doses,
            price,
            vaccines!inner (
              id,
              name,
              manufacturer
            )
          `)
          .eq("hospital_id", hospitalId)

        if (basicError) {
          throw new Error(`Failed to fetch vaccines: ${basicError.message}`)
        }

        console.log("Basic vaccine data:", basicData)

        // Transform the basic data
        return basicData?.map(availability => ({
          id: availability.vaccines.id,
          name: availability.vaccines.name,
          manufacturer: availability.vaccines.manufacturer,
          description: "",
          age_group: "",
          doses_required: 1,
          vaccine_availability: [
            {
              id: availability.id,
              available_doses: availability.available_doses,
              price: availability.price,
              last_updated: null
            }
          ]
        })) || []
      }

      throw new Error(`Failed to fetch vaccines: ${error.message}`)
    }

    console.log("Raw vaccine data:", data)

    // Transform the data to match the expected frontend structure
    const transformedData = data?.map(availability => ({
      id: availability.vaccines.id,
      name: availability.vaccines.name,
      manufacturer: availability.vaccines.manufacturer,
      description: availability.vaccines.description || "",
      age_group: availability.vaccines.age_group || "",
      doses_required: availability.vaccines.doses_required || 1,
      vaccine_availability: [
        {
          id: availability.id,
          available_doses: availability.available_doses,
          price: availability.price,
          last_updated: availability.last_updated || null
        }
      ]
    })) || []

    console.log("Transformed vaccine data:", transformedData)
    return transformedData
  }

  /**
   * Update vaccine availability
   * @param {string} availabilityId - Vaccine availability ID
   * @param {object} updateData - Data to update
   */
  async updateVaccineAvailability(availabilityId, updateData) {
    if (!this.supabaseAdmin) await this.initialize()

    const { data, error } = await this.supabaseAdmin
      .from("vaccine_availability")
      .update({
        ...updateData,
        last_updated: new Date().toISOString(),
      })
      .eq("id", availabilityId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update vaccine availability: ${error.message}`)
    return data
  }

  /**
   * Remove vaccine from hospital
   * @param {string} availabilityId - Vaccine availability ID
   */
  async removeVaccineFromHospital(availabilityId) {
    if (!this.supabaseAdmin) await this.initialize()

    const { error } = await this.supabaseAdmin.from("vaccine_availability").delete().eq("id", availabilityId)

    if (error) throw new Error(`Failed to remove vaccine: ${error.message}`)
    return true
  }

  /**
   * Get vaccine statistics for hospital
   * @param {string} hospitalId - Hospital ID
   */
  async getVaccineStats(hospitalId) {
    if (!this.supabaseAdmin) await this.initialize()

    const { data, error } = await this.supabaseAdmin
      .from("vaccine_availability")
      .select("available_doses")
      .eq("hospital_id", hospitalId)

    if (error) throw new Error(`Failed to fetch vaccine stats: ${error.message}`)

    return {
      total: data?.length || 0,
      totalDoses: data?.reduce((sum, v) => sum + (v.available_doses || 0), 0) || 0,
    }
  }
}

export const vaccineController = new VaccineController()
