"use server"
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { revalidatePath } from 'next/cache'
import { createStripeCustomer } from '@/utils/stripe/api'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { sendWelcomeEmail } from '@/utils/email/send-welcome-email'


// Sanitize environment variable - remove whitespace and newlines
const PUBLIC_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim()

export async function resetPassword(currentState: { message: string }, formData: FormData) {
    const supabase = createClient()
    const passwordData = {
        password: formData.get('password') as string,
        confirm_password: formData.get('confirm_password') as string,
        code: formData.get('code') as string
    }
    if (passwordData.password !== passwordData.confirm_password) {
        return { message: "Passwords do not match" }
    }

    const { data } = await supabase.auth.exchangeCodeForSession(passwordData.code)

    let { error } = await supabase.auth.updateUser({
        password: passwordData.password
    })
    if (error) {
        return { message: error.message }
    }
    redirect(`/forgot-password/reset/success`)
}


export async function forgotPassword(currentState: { message: string }, formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${PUBLIC_URL}/forgot-password/reset` })

    if (error) {
        return { message: error.message }
    }
    redirect(`/forgot-password/success`)
}


export async function signup(currentState: { message: string }, formData: FormData) {
    const supabase = createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
    }

    // Check if user exists in our database first
    const existingDBUser = await db.select().from(usersTable).where(eq(usersTable.email, data.email))
    
    if (existingDBUser.length > 0) {
        return { message: "An account with this email already exists. Please login instead." }
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            emailRedirectTo: `${PUBLIC_URL}/auth/callback`,
            data: {
                email_confirm: process.env.NODE_ENV !== 'production',
                full_name: data.name
            }
        }
    })

    if (signUpError) {
        if (signUpError.message.includes("already registered")) {
            return { message: "An account with this email already exists. Please login instead." }
        }
        return { message: signUpError.message }
    }

    if (!signUpData?.user) {
        return { message: "Failed to create user" }
    }

    // Check if email confirmation is required
    // In production, Supabase requires email confirmation by default
    // The user will receive a confirmation email from Supabase
    const requiresEmailConfirmation = process.env.NODE_ENV === 'production'
    const isEmailConfirmed = signUpData.user.email_confirmed_at !== null
    const hasConfirmationEmail = signUpData.user.confirmation_sent_at !== null

    console.log('Signup result:', {
        userId: signUpData.user.id,
        email: signUpData.user.email,
        requiresConfirmation: requiresEmailConfirmation,
        isConfirmed: isEmailConfirmed,
        confirmationSent: hasConfirmationEmail
    })

    try {
        // Stripe is only used when anchoring/registering a qualified PoC (fee-based operator service)
        // Use a placeholder value - Stripe customer will be created on-demand when user registers a PoC
        const stripeID = 'pending'
        
        // Create record in DB
        await db.insert(usersTable).values({ 
            id: signUpData.user.id,
            name: data.name, 
            email: signUpData.user.email!, 
            stripe_id: stripeID, 
            plan: 'none' 
        })
        
        // Send welcome email:
        // - In production, defer until email confirmation (handled in /auth/auth/confirm)
        // - In development or if already confirmed, send immediately
        if (!requiresEmailConfirmation || isEmailConfirmed) {
            try {
                const res = await sendWelcomeEmail({
                    userEmail: signUpData.user.email!,
                    userName: data.name
                })
                if (!res.success) {
                    console.warn('Welcome email not sent:', res.error)
                }
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError)
                // Continue - signup should succeed even if email fails
            }
        }
    } catch (err) {
        console.error("Error in signup:", err instanceof Error ? err.message : "Unknown error")
        return { message: "Failed to setup user account" }
    }

    revalidatePath("/", "layout")
    
    // If email confirmation is required and not confirmed, redirect to check email page
    if (requiresEmailConfirmation && !isEmailConfirmed) {
        redirect("/signup/check-email")
    }
    
    // Otherwise, redirect to dashboard (user is confirmed or in dev mode)
    redirect("/dashboard")
}


export async function loginUser(currentState: { message: string }, formData: FormData) {
    const supabase = createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}


export async function logout() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    // After logout, route to public FractiAI landing (with login/signup CTAs).
    redirect('/fractiai')
}

// Alias for compatibility
export const signOut = logout


export async function signInWithGoogle() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
        },
    })

    if (error) {
        console.error("Google OAuth error:", error)
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.url) {
        redirect(data.url)
    }
    
    redirect('/login?error=oauth_failed')
}


// GitHub OAuth has been disabled - function removed
// export async function signInWithGithub() { ... }