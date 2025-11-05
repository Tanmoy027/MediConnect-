import { NextResponse } from "next/server"
import { authController, BaseController } from "@/lib/controllers"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, role } = body

    BaseController.validateRequired(body, ["email", "password", "fullName"])

    // Validate email format
    if (!BaseController.isValidEmail(email)) {
      return NextResponse.json(BaseController.handleError(new Error("Invalid email format"), "Invalid email format"), {
        status: 400,
      })
    }

    // Sanitize input
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      role: role || "normal_user",
    }

    // Register user
    const result = await authController.registerUser(
      sanitizedData.email,
      sanitizedData.password,
      sanitizedData.fullName,
      sanitizedData.phone,
      sanitizedData.role,
    )

    return NextResponse.json(BaseController.success(result, "Registration successful"), { status: 201 })
  } catch (error) {
    console.error("Error in registration API:", error)
    const errorResponse = BaseController.handleError(error, "Registration failed")
    return NextResponse.json(errorResponse, { status: 400 })
  }
}
