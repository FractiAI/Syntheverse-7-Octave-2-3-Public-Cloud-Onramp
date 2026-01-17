import React from 'react';
import SubmitContributionForm from '@/components/SubmitContributionForm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { redirect } from 'next/navigation';

export default async function SubmitPage() {
    const { user } = await getAuthenticatedUserWithRole();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#05070a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 border-b border-[#1a1f2e] pb-6">
                    <h1 className="text-2xl font-bold tracking-widest text-[#3399ff]">SUBMISSION PAGE</h1>
                    <p className="text-xs text-[#606060] mt-1">PROOF-OF-CONTRIBUTION INITIALIZATION</p>
                </header>
                <SubmitContributionForm userEmail={user.email} />
            </div>
        </div>
    );
}

