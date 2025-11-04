export { authController, AuthController } from "./authentication"
export {
  hospitalController,
  HospitalController,
  appointmentController,
  AppointmentController,
  vaccineController,
  VaccineController,
  emergencyController,
  EmergencyController,
} from "./hospital"
export { bloodBankController, BloodBankController } from "./blood-bank"

// Base controller class for common functionality
export class BaseController {
  /**
   * Handle controller errors and return standardized error response
   */
  static handleError(error, defaultMessage = "Operation failed") {
    console.error("Controller Error:", error)

    return {
      success: false,
      error: error.message || defaultMessage,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Return standardized success response
   */
  static success(data, message = "Operation successful") {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Validate required fields
   */
  static validateRequired(data, requiredFields) {
    const missing = []

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missing.push(field)
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`)
    }

    return true
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data) {
    const sanitized = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        sanitized[key] = value.trim()
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}
