import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/jwt"
import { DatabaseOperations } from "@/lib/database/operations"
import { EmailService } from "@/lib/email/service"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user
    const user = await DatabaseOperations.findUserByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ message: "If an account with that email exists, we've sent a password reset link." })
    }

    // Generate reset token
    const resetToken = AuthService.generateResetToken(user.id)

    // Update user with reset token and expiration
    await DatabaseOperations.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    // Send password reset email
    const emailTemplate = EmailService.generatePasswordResetEmail(user.email, resetToken, user.firstName)
    const emailSent = await EmailService.sendEmail(emailTemplate)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
    }

    return NextResponse.json({ message: "If an account with that email exists, we've sent a password reset link." })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
