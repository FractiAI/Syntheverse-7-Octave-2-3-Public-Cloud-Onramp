import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import MRIScannerConsole from '@/components/MRIScannerConsole';
import '../synthscan-mri.css';

export const dynamic = 'force-dynamic';

export default async function MRIScannerPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login?redirect=/mri-scanner');
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-10 text-center relative">
          <Link href="/operator/dashboard" className="absolute left-0 top-0 text-slate-500 hover:text-[#4169E1] transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft className="h-3 w-3" />
                   Back to Tesla Console
          </Link>
          <h1 className="text-4xl font-black tracking-tighter mb-2" style={{
            textShadow: '0 0 30px rgba(65, 105, 225, 0.4)'
          }}>
            SYNTHSCAN™ MRI TEST CONSOLE
          </h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">
            Instrumental Grade Verification · NSPFRP Protocol Compliance
          </p>
        </div>

        <MRIScannerConsole />
      </div>
    </div>
  );
}
