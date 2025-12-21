import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import SignupForm from "@/components/SignupForm"
import ProviderSigninBlock from "@/components/ProviderSigninBlock"

export default function Signup() {
    return (
        <div className="flex items-center justify-center min-h-screen">

            <Card className="w-[400px] mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center py-4">
                        <Link href='/' className="text-2xl font-bold">
                            Syntheverse
                        </Link>
                    </div>

                    <CardTitle className="text-2xl font-bold">Join Syntheverse</CardTitle>
                    <CardDescription>Create your account to start contributing</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SignupForm />
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
                <CardFooter className="flex-col text-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link className="text-primary hover:underline" href="/login">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div >

    )
}