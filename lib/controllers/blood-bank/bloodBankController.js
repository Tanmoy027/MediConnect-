import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Blood Bank Controller - Handles all blood bank admin related operations
 * Manages blood bank creation, updates, inventory, and campaigns
 */
export class BloodBankController {
  constructor() {
    this.supabase = null
    this.supabaseAdmin = null
  }

  async initialize() {
    this.supabase = await createClient()
    this.supabaseAdmin = createAdminClient()
  }

  /**
   * Verify if user is blood bank admin and has access to blood bank
   * @param {string} userId - User ID to verify
   * @param {string} bloodBankId - Optional: specific blood bank ID to check access
   */
  async verifyBloodBankAdmin(userId, bloodBankId = null) {
    if (!this.supabaseAdmin) await this.initialize()

    // Check user role
    const { data: profile, error: profileError } = await this.supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError || !profile || profile.role !== "blood_bank_admin") {
      throw new Error("Access denied: Not a blood bank admin")
    }

    // If bloodBankId provided, verify admin has access to this blood bank
    if (bloodBankId) {
      const { data: bloodBank, error: bankError } = await this.supabaseAdmin
        .from("blood_banks")
        .select("admin_id")
        .eq("id", bloodBankId)
        .single()

      if (bankError || !bloodBank || bloodBank.admin_id !== userId) {
        throw new Error("Access denied: Not authorized for this blood bank")
      }
    }

    return true
  }

  /**
   * Get blood bank by admin ID
   * @param {string} adminId - Admin user ID
   */
  async getBloodBankByAdmin(adminId) {
    if (!this.supabase) await this.initialize()

    const { data: bloodBanks, error } = await this.supabase
      .from("blood_banks")
      .select("*")
      .eq("admin_id", adminId)
      .eq("is_active", true)

    if (error) {
      throw new Error(`Failed to fetch blood bank: ${error.message}`)
    }

    return bloodBanks?.[0] || null
  }

  /**
   * Create new blood bank
   * @param {string} adminId - Admin user ID
   * @param {object} bloodBankData - Blood bank data to create
   */
  async createBloodBank(adminId, bloodBankData) {
    if (!this.supabase) await this.initialize()

    await this.verifyBloodBankAdmin(adminId)

    const insertData = {
      admin_id: adminId,
      name: bloodBankData.name,
      phone: bloodBankData.phone,
      address: bloodBankData.address,
      city: bloodBankData.city,
      state: bloodBankData.state,
      pincode: bloodBankData.pincode,
      email: bloodBankData.email || null,
      license_number: bloodBankData.licenseNumber || null,
      operating_hours: bloodBankData.operatingHours || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: bloodBank, error } = await this.supabase.from("blood_banks").insert(insertData).select().single()

    if (error) {
      throw new Error(`Failed to create blood bank: ${error.message}`)
    }

    // Initialize inventory for all blood types
    await this.initializeInventory(bloodBank.id)

    return bloodBank
  }

  /**
   * Initialize blood inventory for all blood types
   * @param {string} bloodBankId - Blood bank ID
   */
  async initializeInventory(bloodBankId) {
    if (!this.supabaseAdmin) await this.initialize()

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    for (const bloodType of bloodTypes) {
      const { error } = await this.supabaseAdmin.from("blood_inventory").insert({
        blood_bank_id: bloodBankId,
        blood_type: bloodType,
        units_available: 0,
      })

      if (error && !error.message.includes("duplicate")) {
        console.error(`Error initializing inventory for ${bloodType}:`, error)
      }
    }
  }

  /**
   * Update blood bank information
   * @param {string} adminId - Admin user ID
   * @param {string} bloodBankId - Blood bank ID to update
   * @param {object} updateData - Data to update
   */
  async updateBloodBank(adminId, bloodBankId, updateData) {
    if (!this.supabase) await this.initialize()

    await this.verifyBloodBankAdmin(adminId, bloodBankId)

    const { data: bloodBank, error } = await this.supabase
      .from("blood_banks")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bloodBankId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update blood bank: ${error.message}`)
    }

    return bloodBank
  }

  /**
   * Add blood stock to inventory
   * @param {string} bloodBankId - Blood bank ID
   * @param {string} bloodType - Blood type (A+, A-, etc.)
   * @param {number} units - Number of units to add
   */
  async addBloodStock(bloodBankId, bloodType, units) {
    if (!this.supabase) await this.initialize()
    if (!this.supabaseAdmin) await this.initialize()

    const { data: inventory, error: fetchError } = await this.supabase
      .from("blood_inventory")
      .select("units_available")
      .eq("blood_bank_id", bloodBankId)
      .eq("blood_type", bloodType)
      .maybeSingle()

    if (fetchError) {
      throw new Error(`Failed to fetch inventory: ${fetchError.message}`)
    }

    const currentUnits = inventory?.units_available || 0

    if (!inventory) {
      const { data: created, error: createError } = await this.supabaseAdmin
        .from("blood_inventory")
        .insert({
          blood_bank_id: bloodBankId,
          blood_type: bloodType,
          units_available: units,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create blood inventory: ${createError.message}`)
      }

      return created
    }

    const newUnits = currentUnits + units

    const { data: updated, error } = await this.supabaseAdmin
      .from("blood_inventory")
      .update({
        units_available: newUnits,
        last_updated: new Date().toISOString(),
      })
      .eq("blood_bank_id", bloodBankId)
      .eq("blood_type", bloodType)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update blood stock: ${error.message}`)
    }

    return updated
  }

  /**
   * Get blood bank inventory
   * @param {string} bloodBankId - Blood bank ID
   */
  async getInventory(bloodBankId) {
    if (!this.supabase) await this.initialize()

    const { data: inventory, error } = await this.supabase
      .from("blood_inventory")
      .select("*")
      .eq("blood_bank_id", bloodBankId)
      .order("blood_type")

    if (error) {
      throw new Error(`Failed to fetch inventory: ${error.message}`)
    }

    return inventory || []
  }

  /**
   * Create campaign
   * @param {string} adminId - Admin user ID
   * @param {string} bloodBankId - Blood bank ID
   * @param {object} campaignData - Campaign data
   */
  async createCampaign(adminId, bloodBankId, campaignData) {
    if (!this.supabase) await this.initialize()

    await this.verifyBloodBankAdmin(adminId, bloodBankId)

    const insertData = {
      organizer_id: adminId,
      blood_bank_id: bloodBankId,
      title: campaignData.title,
      description: campaignData.description,
      venue: campaignData.venue,
      address: campaignData.address,
      city: campaignData.city,
      state: campaignData.state,
      start_date: campaignData.startDate,
      end_date: campaignData.endDate,
      target_donors: campaignData.targetDonors || 0,
      contact_number: campaignData.contactNumber,
      contact_email: campaignData.contactEmail,
      requirements: campaignData.requirements,
      status: "upcoming",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: campaign, error } = await this.supabase.from("campaigns").insert(insertData).select().single()

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`)
    }

    return campaign
  }

  /**
   * Get campaigns for blood bank
   * @param {string} bloodBankId - Blood bank ID
   * @param {string} status - Optional: filter by status
   */
  async getCampaigns(bloodBankId, status = null) {
    if (!this.supabase) await this.initialize()

    let query = this.supabase.from("campaigns").select("*").eq("blood_bank_id", bloodBankId)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: campaigns, error } = await query.order("start_date", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`)
    }

    return campaigns || []
  }

  /**
   * Update campaign status
   * @param {string} adminId - Admin user ID
   * @param {string} campaignId - Campaign ID
   * @param {string} status - New status
   */
  async updateCampaignStatus(adminId, campaignId, status) {
    if (!this.supabase) await this.initialize()

    // Verify admin owns this campaign
    const { data: campaign } = await this.supabase
      .from("campaigns")
      .select("organizer_id")
      .eq("id", campaignId)
      .single()

    if (!campaign || campaign.organizer_id !== adminId) {
      throw new Error("Access denied: Not authorized to update this campaign")
    }

    const { data: updated, error } = await this.supabase
      .from("campaigns")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`)
    }

    return updated
  }

  /**
   * Get blood bank statistics
   * @param {string} bloodBankId - Blood bank ID
   */
  async getBloodBankStats(bloodBankId) {
    if (!this.supabaseAdmin) await this.initialize()

    // Get total inventory
    const { data: inventory } = await this.supabaseAdmin
      .from("blood_inventory")
      .select("units_available")
      .eq("blood_bank_id", bloodBankId)

    // Get active campaigns
    const { data: campaigns } = await this.supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("blood_bank_id", bloodBankId)
      .eq("status", "active")

    // Get total blood collected
    const { data: completedCampaigns } = await this.supabaseAdmin
      .from("campaigns")
      .select("blood_collected")
      .eq("blood_bank_id", bloodBankId)
      .eq("status", "completed")

    const stats = {
      totalUnits: inventory?.reduce((sum, item) => sum + (item.units_available || 0), 0) || 0,
      bloodTypes: inventory?.length || 0,
      activeCampaigns: campaigns?.length || 0,
      totalCollected: completedCampaigns?.reduce((sum, item) => sum + (item.blood_collected || 0), 0) || 0,
    }

    return stats
  }
}

// Export singleton instance
export const bloodBankController = new BloodBankController()
