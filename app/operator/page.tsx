import React from 'react';
import HeroOperatorPanel from '@/components/HeroOperatorPanel';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { redirect } from 'next/navigation';

export default async function OperatorPage() {
    const { user, isOperator } = await getAuthenticatedUserWithRole();

    if (!user || !isOperator) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#05070a] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b border-[#1a1f2e] pb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-[#3399ff]">OPERATOR CONSOLE</h1>
                        <p className="text-xs text-[#606060] mt-1">HHF-AI MRI CORE MANAGEMENT</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] bg-[#1a1f2e] px-2 py-1 rounded text-[#3399ff] font-bold">STATUS: AUTHORIZED</span>
                    </div>
                </header>
                <HeroOperatorPanel />
            </div>
        </div>
    );
}
