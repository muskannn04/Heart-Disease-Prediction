import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
import { DatabaseOperations } from "@/lib/database/operations"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await DatabaseOperations.findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json({ error: "Account is temporarily locked. Please try again later." }, { status: 423 })
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, user.password)
    if (!isValidPassword) {
      // Increment login attempts
      const loginAttempts = user.loginAttempts + 1
      const updates: any = { loginAttempts }

      // Lock account after 5 failed attempts
      if (loginAttempts >= 5) {
        updates.lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }

      await DatabaseOperations.updateUser(user.id, updates)

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Reset login attempts on successful login
    await DatabaseOperations.updateUser(user.id, {
      loginAttempts: 0,
      lockUntil: undefined,
      lastLogin: new Date(),
    })

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await DatabaseOperations.createSession({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
