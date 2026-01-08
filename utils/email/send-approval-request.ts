/**
 * Email utility for sending PoC approval request emails to admin
 */

import { Resend } from 'resend';
import { debug, debugError } from '@/utils/debug';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'espressolico@gmail.com';
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export interface ApprovalRequestData {
  submission_hash: string;
  title: string;
  contributor: string;
  pod_score: number;
  metals: string[];
  tokenomics_recommendation?: any;
}

export async function sendApprovalRequestEmail(
  data: ApprovalRequestData
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    debugError(
      'SendApprovalEmail',
      'Resend API key not configured',
      new Error('RESEND_API_KEY not set')
    );
    return { success: false, error: 'Email service not configured' };
  }

  // Generate a secure token for approval/rejection
  const approvalToken = crypto.randomBytes(32).toString('hex');
  const rejectToken = crypto.randomBytes(32).toString('hex');

  // Store tokens temporarily (in production, use Redis or database)
  // For now, we'll encode them in the URL with a timestamp
  const approveUrl = `${BASE_URL}/api/admin/approve-allocation?hash=${data.submission_hash}&token=${approvalToken}&action=approve`;
  const rejectUrl = `${BASE_URL}/api/admin/approve-allocation?hash=${data.submission_hash}&token=${rejectToken}&action=reject`;
  const viewUrl = `${BASE_URL}/dashboard?submission=${data.submission_hash}`;

  const metalsList = data.metals.length > 0 ? data.metals.join(', ') : 'Not assigned';
  const suggestedAllocation = data.tokenomics_recommendation?.suggested_allocation || 0;
  const eligibleEpochs = data.tokenomics_recommendation?.eligible_epochs || [];

  try {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PoC Approval Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🔬 Syntheverse PoC Approval Request</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            A new Proof-of-Contribution (PoC) has been qualified and requires your approval for token allocation.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <h2 style="margin-top: 0; color: #667eea;">${data.title}</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 40%;">Contributor:</td>
                    <td style="padding: 8px 0;">${data.contributor}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">PoC Score:</td>
                    <td style="padding: 8px 0; color: #667eea; font-size: 18px; font-weight: bold;">${data.pod_score.toLocaleString()} / 10,000</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Metals:</td>
                    <td style="padding: 8px 0;">${metalsList}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Submission Hash:</td>
                    <td style="padding: 8px 0; font-family: monospace; font-size: 12px; word-break: break-all;">${data.submission_hash}</td>
                </tr>
                ${
                  suggestedAllocation > 0
                    ? `
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Suggested Allocation:</td>
                    <td style="padding: 8px 0;">${suggestedAllocation.toLocaleString()} SYNTH</td>
                </tr>
                `
                    : ''
                }
                ${
                  eligibleEpochs.length > 0
                    ? `
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Eligible Epochs:</td>
                    <td style="padding: 8px 0;">${eligibleEpochs.join(', ')}</td>
                </tr>
                `
                    : ''
                }
            </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${approveUrl}" 
               style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px; font-size: 16px;">
                ✅ Approve Allocation
            </a>
            <a href="${rejectUrl}" 
               style="display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                ❌ Reject
            </a>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="${viewUrl}" 
               style="color: #667eea; text-decoration: none; font-size: 14px;">
                View Full PoC Details →
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated notification from the Syntheverse PoC Evaluation System.</p>
            <p style="margin: 5px 0 0 0;">If you did not expect this email, please ignore it.</p>
        </div>
    </div>
</body>
</html>
        `;

    const result = await resend.emails.send({
      from: 'Syntheverse PoC <noreply@syntheverse.ai>', // Update with your verified domain
      to: ADMIN_EMAIL,
      subject: `🔬 PoC Approval Request: ${data.title} (Score: ${data.pod_score})`,
      html: emailHtml,
    });

    debug('SendApprovalEmail', 'Approval request email sent', {
      submission_hash: data.submission_hash,
      email_id: result.data?.id,
      recipient: ADMIN_EMAIL,
    });

    return { success: true };
  } catch (error) {
    debugError('SendApprovalEmail', 'Failed to send approval request email', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
