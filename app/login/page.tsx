import React from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-4 text-white">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-widest text-[#3399ff]">SYSTEM_ACCESS</h1>
                    <p className="text-xs text-[#606060] mt-2 uppercase tracking-widest">POST-SINGULARITY^6 AUTHENTICATION</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
