import { NextResponse } from "next/server"
import { authController, BaseController } from "@/lib/controllers"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    BaseController.validateRequired(body, ["email", "password"])

    // Sanitize input
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      password: password.trim(),
    }

    // Login user
    const result = await authController.loginUser(sanitizedData.email, sanitizedData.password)

    return NextResponse.json(BaseController.success(result, "Login successful"), { status: 200 })
  } catch (error) {
    console.error("[v0] Login error:", error.message)
    const errorResponse = BaseController.handleError(error, "Login failed")
    return NextResponse.json(errorResponse, { status: 401 })
  }
}
