import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import Link from 'next/link'

import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import LoginForm from "@/components/LoginForm"
export default function Login() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[400px] mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center py-4">
                        <Link href='/' className="text-2xl font-bold">
                            Syntheverse
                        </Link>
                    </div>

                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Sign in to access your contributor dashboard</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <LoginForm />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <ProviderSigninBlock />
                </CardContent>
                <CardFooter className="flex-col text-center space-y-2">
                    <Link className="text-sm text-muted-foreground hover:text-primary" href="/forgot-password">
                        Forgot password?
                    </Link>
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link className="text-primary hover:underline" href="/signup">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div >

    )
}