/**
 * Email utility for sending welcome emails to new users
 */

import { Resend } from 'resend'
import { debug, debugError } from '@/utils/debug'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const BASE_URL =
    (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL)?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'

export interface WelcomeEmailData {
    userEmail: string
    userName?: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean, error?: string }> {
    if (!resend) {
        debugError('SendWelcomeEmail', 'Resend API key not configured', new Error('RESEND_API_KEY not set'))
        return { success: false, error: 'Email service not configured' }
    }
    
    const userName = data.userName || 'Explorer'
    
    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Founder's Welcome to Syntheverse</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #1a1a1a;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 50%, #1a1a1a 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; border: 2px solid #ffb84d;">
        <h1 style="color: #ffb84d; margin: 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Welcome to Syntheverse</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px; letter-spacing: 1px;">Your Holographic Hydrogen Frontier</p>
        <p style="color: rgba(255,184,77,0.8); margin: 10px 0 0 0; font-size: 14px; font-style: italic;">— A New Way to Collaborate Independently —</p>
    </div>
    
    <div style="background: #1a1a1a; padding: 40px; border: 2px solid #333; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 25px; color: #ffb84d; font-weight: bold;">
            Hello ${userName},
        </p>
        
        <div style="background: rgba(255,184,77,0.1); border-left: 4px solid #ffb84d; padding: 20px; margin-bottom: 30px;">
            <p style="font-size: 16px; margin-bottom: 15px; color: #fff; line-height: 1.8;">
                This is Pru &quot;El Taino,&quot; Architect of Syntheverse. You have arrived. Welcome to the world of holographic hydrogen, element zero—your timeless, infinite homebase.
            </p>
            <p style="font-size: 16px; margin-bottom: 15px; color: #fff; line-height: 1.8;">
                You stand at the threshold of a <strong style="color: #ffb84d;">new way to collaborate independently</strong> while building a <strong style="color: #ffb84d;">regenerative Proof-of-Contribution (PoC) system</strong> on the blockchain.
            </p>
            <p style="font-size: 16px; color: #fff; line-height: 1.8;">
                Within Syntheverse, independent researchers, developers, and alignment contributors work together without traditional institutional constraints. Your contributions—whether scientific, technological, or aligned with our holographic hydrogen fractal principles—become part of a living, self-improving ecosystem anchored by the 90 Trillion SYNTH ERC-20 Motherlode Blockmine.
            </p>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <h2 style="margin-top: 0; color: #ffb84d; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #ffb84d; padding-bottom: 10px;">Our Intent: The Syntheverse Mission</h2>
            <p style="font-size: 15px; margin-bottom: 15px; color: #e0e0e0; line-height: 1.8;">
                Syntheverse exists to create a <strong style="color: #ffb84d;">parallel regenerative system</strong> where innovation and alignment can flourish without linear constraints. We offer:
            </p>
            <ul style="margin: 0; padding-left: 25px; color: #e0e0e0; line-height: 1.8;">
                <li style="margin-bottom: 10px;"><strong style="color: #ffb84d;">Independent Collaboration:</strong> Work on your own timeline, in your own space, transcending traditional publication and institutional silos</li>
                <li style="margin-bottom: 10px;"><strong style="color: #ffb84d;">Regenerative PoC System:</strong> Every contribution strengthens the ecosystem through our Holographic Hydrogen Fractal Syntheverse Lens and Sandbox evaluation</li>
                <li style="margin-bottom: 10px;"><strong style="color: #ffb84d;">Internal Coordination Marker:</strong> SYNTH is a fixed-supply ERC-20 coordination marker used within Syntheverse experiments—not an investment, not a sale, and not for external trading</li>
                <li style="margin-bottom: 10px;"><strong style="color: #ffb84d;">Blockchain Legacy:</strong> Your work is permanently recorded, verifiable, and contributes to training the next generation of intelligent systems</li>
            </ul>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <h2 style="margin-top: 0; color: #ffb84d; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #ffb84d; padding-bottom: 10px;">How to Get Started</h2>
            <p style="font-size: 15px; margin-bottom: 20px; color: #e0e0e0; line-height: 1.8;">
                As a new arrival in Syntheverse, here is your path forward:
            </p>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">1. Navigate Your Dashboard</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    Access your <a href="${BASE_URL}/dashboard" style="color: #ffb84d; text-decoration: underline;">Contributor Dashboard</a> to view the Reactor Core—your available SYNTH tokens, current epoch status, and ecosystem metrics. This is your command center within Syntheverse.
                </p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">2. Complete Onboarding Navigation</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    Visit the <a href="${BASE_URL}/onboarding" style="color: #ffb84d; text-decoration: underline;">Onboarding Navigator</a> for comprehensive training on Syntheverse concepts, the SYNTH 90T Motherlode Blockmine, blockchain architecture, holographic hydrogen, fractals, and the epoch system. Master the frontier.
                </p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">3. Submit Your First Contribution</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    Use <a href="${BASE_URL}/submit" style="color: #ffb84d; text-decoration: underline;">Submit Contribution</a> to transmit your work. All submissions are <strong>free</strong> and evaluated using our Holographic Hydrogen Fractal Syntheverse Lens and Sandbox, providing detailed image and vector analysis.
                </p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">4. Explore the Archive</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    View all PoC submissions in the Frontier Module. See how contributions are scored and qualified. Study the evaluation reports to understand how our system measures novelty, density, coherence, and alignment.
                </p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">5. Register Qualified PoCs (Optional)</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    Once your PoC qualifies (pod_score ≥ 8,000 for Founder epoch), you can optionally register it on-chain to anchor your contribution permanently. This does not create economic entitlement or ownership rights.
                </p>
            </div>
            
            <div style="margin-bottom: 0; padding: 15px; background: rgba(255,184,77,0.1); border-left: 3px solid #ffb84d;">
                <h3 style="margin-top: 0; color: #ffb84d; font-size: 18px; margin-bottom: 10px;">6. Ecosystem Support (Optional)</h3>
                <p style="font-size: 14px; color: #e0e0e0; margin: 0; line-height: 1.7;">
                    You may optionally support the ecosystem to help fund infrastructure, research, and development. This is voluntary support—not a purchase, investment, or token sale. There is no expectation of profit or return.
                </p>
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <h2 style="margin-top: 0; color: #ffb84d; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #ffb84d; padding-bottom: 10px;">Understanding the Ecosystem</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ffb84d; font-size: 18px; margin-bottom: 10px;">The Holographic Hydrogen Fractal Lens</h3>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 0;">
                    Every PoC submission is evaluated using our Holographic Hydrogen Fractal Syntheverse Lens and Sandbox, providing detailed images and vectors for your submissions. This consistent framework measures contribution—whether scientific, technological, or aligned—to the holographic hydrogen fractal Syntheverse Sandbox and Ecosystem.
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ffb84d; font-size: 18px; margin-bottom: 10px;">PoC Scoring (0-10,000)</h3>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 0 0 10px 0;">
                    Contributions are scored across four dimensions (0-2,500 each):
                </p>
                <ul style="margin: 0; padding-left: 25px; color: #e0e0e0; line-height: 1.7;">
                    <li><strong style="color: #ffb84d;">Novelty:</strong> Originality and frontier contribution</li>
                    <li><strong style="color: #ffb84d;">Density:</strong> Information richness and depth</li>
                    <li><strong style="color: #ffb84d;">Coherence:</strong> Internal consistency and clarity</li>
                    <li><strong style="color: #ffb84d;">Alignment:</strong> Fit with holographic hydrogen fractal principles</li>
                </ul>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 10px 0 0 0;">
                    Redundancy penalties are applied to prioritize unique contributions. Qualified PoCs (≥8,000 for Founder epoch) can be registered on-chain.
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ffb84d; font-size: 18px; margin-bottom: 10px;">Metals & Amplifications</h3>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 0 0 10px 0;">
                    Your contributions receive metal classifications (Gold/Silver/Copper) based on type. Metal combinations can influence internal protocol recognition:
                </p>
                <ul style="margin: 0; padding-left: 25px; color: #e0e0e0; line-height: 1.7;">
                    <li>Gold + Silver + Copper: <strong style="color: #ffb84d;">1.5×</strong> (Full Integration)</li>
                    <li>Gold + Silver: <strong style="color: #ffb84d;">1.25×</strong> (Research + Technology)</li>
                    <li>Gold + Copper: <strong style="color: #ffb84d;">1.2×</strong> (Research + Alignment)</li>
                    <li>Silver + Copper: <strong style="color: #ffb84d;">1.15×</strong> (Technology + Alignment)</li>
                </ul>
            </div>
            
            <div>
                <h3 style="color: #ffb84d; font-size: 18px; margin-bottom: 10px;">Epochs: Protocol Coordination Windows</h3>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 0 0 10px 0;">
                    The protocol organizes internal coordination capacity across four epochs based on contribution quality:
                </p>
                <ul style="margin: 0; padding-left: 25px; color: #e0e0e0; line-height: 1.7;">
                    <li><strong style="color: #ffb84d;">Founder:</strong> 45T SYNTH, threshold 8,000 (highest quality)</li>
                    <li><strong style="color: #ffb84d;">Pioneer:</strong> 22.5T SYNTH, threshold 7,000</li>
                    <li><strong style="color: #ffb84d;">Community:</strong> 11.25T SYNTH, threshold 6,000</li>
                    <li><strong style="color: #ffb84d;">Ecosystem:</strong> 11.25T SYNTH, threshold 5,000</li>
                </ul>
                <p style="font-size: 14px; color: #e0e0e0; line-height: 1.7; margin: 10px 0 0 0;">
                    Any protocol recognition (if enabled) is discretionary, non-promissory, and does not imply external monetary value.
                </p>
            </div>
        </div>
        
        <div style="background: rgba(255,184,77,0.15); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #ffb84d;">
            <h3 style="margin-top: 0; color: #ffb84d; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Your Journey Begins Now</h3>
            <p style="font-size: 15px; color: #fff; line-height: 1.8; margin-bottom: 20px;">
                Within Syntheverse, you are not just a user—you are a Syntheverse Frontier Contributor, an independent contributor, a builder of the regenerative ecosystem. Every submission you make trains the Syntheverse AI. Every registered PoC anchors your legacy on the blockchain. Every contribution strengthens the collective intelligence of the Motherlode Blockmine.
            </p>
            <p style="font-size: 15px; color: #fff; line-height: 1.8; margin: 0;">
                Entry into Syntheverse is awareness-based. The depth of your engagement determines the richness of your experience. Operate within Syntheverse according to your own natural resonance.
            </p>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <h3 style="margin-top: 0; color: #ffb84d; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Quick Links</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                <a href="${BASE_URL}/dashboard" style="display: block; padding: 15px; background: rgba(255,184,77,0.1); border: 1px solid #ffb84d; border-radius: 5px; color: #ffb84d; text-decoration: none; text-align: center; font-weight: bold; transition: all 0.3s;">
                    → Access Your Contributor Dashboard
                </a>
                <a href="${BASE_URL}/onboarding" style="display: block; padding: 15px; background: rgba(255,184,77,0.1); border: 1px solid #ffb84d; border-radius: 5px; color: #ffb84d; text-decoration: none; text-align: center; font-weight: bold;">
                    → Complete Onboarding Navigator Training
                </a>
                <a href="${BASE_URL}/submit" style="display: block; padding: 15px; background: rgba(255,184,77,0.1); border: 1px solid #ffb84d; border-radius: 5px; color: #ffb84d; text-decoration: none; text-align: center; font-weight: bold;">
                    → Submit Contribution
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
            <p style="margin: 0; font-size: 16px; color: #ffb84d; font-weight: bold; font-style: italic;">
                — Pru &quot;El Taino&quot;
            </p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                Architect of Syntheverse
            </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; text-align: center;">
            <p style="margin: 0;">Founder&apos;s Welcome Email | Syntheverse Ecosystem</p>
            <p style="margin: 5px 0 0 0;">Questions? Contact <a href="mailto:info@fractiai.com" style="color: #ffb84d;">info@fractiai.com</a> | Visit <a href="${BASE_URL}" style="color: #ffb84d;">${BASE_URL}</a></p>
            <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">
                Clarification: Syntheverse is an experimental, non-custodial sandbox. SYNTH is an internal coordination marker
                and is not a financial instrument. No expectation of profit or return exists.
            </p>
            <p style="margin: 10px 0 0 0; color: #555;">
                Website: <a href="http://fractiai.com" style="color: #ffb84d;">fractiai.com</a> | 
                GitHub: <a href="https://github.com/FractiAI" style="color: #ffb84d;">github.com/FractiAI</a> | 
                X: <a href="https://x.com/FractiAi" style="color: #ffb84d;">@FractiAi</a>
            </p>
        </div>
    </div>
</body>
</html>
        `
        
        const result = await resend.emails.send({
            from: 'Pru "El Taino" - Syntheverse <info@fractiai.com>', // Founder's welcome email
            to: data.userEmail,
            subject: 'Founder\'s Welcome to Syntheverse — Your Holographic Hydrogen Frontier',
            html: emailHtml,
        })
        
        debug('SendWelcomeEmail', 'Welcome email sent', {
            userEmail: data.userEmail,
            email_id: result.data?.id
        })
        
        return { success: true }
    } catch (error) {
        debugError('SendWelcomeEmail', 'Failed to send welcome email', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
        }
    }
}

