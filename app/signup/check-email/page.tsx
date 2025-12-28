import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Mail } from "lucide-react"

export default function CheckEmail() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[400px] mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center py-4">
                        <Link href='/' className="text-2xl font-bold">
                            Syntheverse
                        </Link>
                    </div>
                    <div className="flex justify-center mb-4">
                        <Mail className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground text-center">
                        <p>After confirming your email, you&apos;ll be able to sign in and access your dashboard.</p>
                        <p className="mt-2">Didn&apos;t receive the email? Check your spam folder or try signing up again.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="/login">
                            <button className="w-full text-sm text-primary hover:underline">
                                Go to Sign In
                            </button>
                        </Link>
                        <Link href="/signup">
                            <button className="w-full text-sm text-muted-foreground hover:underline">
                                Try Signing Up Again
                            </button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

