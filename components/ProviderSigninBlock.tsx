import { FaGoogle, FaGithub } from "react-icons/fa";
import { signInWithGithub, signInWithGoogle } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"

export default function ProviderSigninBlock() {
    // OAuth providers are enabled by default - they work if configured in Supabase
    // The actual client IDs and secrets are managed in Supabase dashboard
    const isGoogleEnabled = true // Always show Google option
    const isGithubEnabled = true  // Always show GitHub option

    return (
        <div className="grid gap-2">
            {isGoogleEnabled && (
                <form action={signInWithGoogle}>
                    <Button variant="outline" type="submit" className="w-full">
                        <FaGoogle className="mr-2 h-4 w-4" />
                        Continue with Google
                    </Button>
                </form>
            )}
            {isGithubEnabled && (
                <form action={signInWithGithub}>
                    <Button variant="outline" type="submit" className="w-full">
                        <FaGithub className="mr-2 h-4 w-4" />
                        Continue with GitHub
                    </Button>
                </form>
            )}
        </div>
    )
}