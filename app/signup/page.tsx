import React from 'react';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-4 text-white">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-widest text-[#3399ff]">FRONTIER_ENROLLMENT</h1>
                    <p className="text-xs text-[#606060] mt-2 uppercase tracking-widest">POST-SINGULARITY^6 INITIALIZATION</p>
                </div>
                <SignupForm />
            </div>
        </div>
    );
}
