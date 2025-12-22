import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ReceiptText, User, Settings, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { } from "@supabase/supabase-js"
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/auth/actions'
import { generateStripeBillingPortalLink } from "@/utils/stripe/api"

export default async function DashboardHeaderProfileDropdown() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Get billing portal URL (only if user exists and has email)
    // Default to subscribe page - we'll try to get portal URL but won't fail if it errors
    let billingPortalURL = "/subscribe"
    
    if (user && user.email) {
        try {
            const portalURL = await generateStripeBillingPortalLink(user.email)
            // Only use the portal URL if it's a valid external URL (Stripe portal)
            // If it returns "/subscribe" or "/dashboard", use that as-is
            if (portalURL) {
                if (portalURL.startsWith("http")) {
                    // External Stripe URL
                    billingPortalURL = portalURL
                } else if (portalURL.startsWith("/")) {
                    // Internal route
                    billingPortalURL = portalURL
                }
            }
        } catch (error) {
            // Silently fail - we already have a default
            console.error("Error generating billing portal link:", error)
        }
    }
    return (
        <nav className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <User className="h-4 w-4" />
                        <span className="sr-only">Open user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="#">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="#">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem asChild>
                        <Link href={billingPortalURL}>
                            <ReceiptText className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </Link>
                    </DropdownMenuItem>
                    <Link href="#">
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <form action={logout} className="w-full">
                            <button type="submit" className="w-full flex" >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span > Log out</span>
                            </button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}