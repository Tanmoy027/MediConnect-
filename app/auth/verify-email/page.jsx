"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState } from "react"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleResendEmail = async () => {
    const email = localStorage.getItem('pendingVerificationEmail')
    if (!email) {
      setResendMessage("Please sign up again to receive a verification email.")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setResendMessage(`Error: ${error.message}`)
      } else {
        setResendMessage("Verification email sent! Please check your inbox and spam folder.")
      }
    } catch (error) {
      setResendMessage("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-linear-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>{"We've sent you a verification link"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the verification link to activate your account. Once verified, you can
                log in to access your dashboard.
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
              </p>

              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${resendMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {resendMessage}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
