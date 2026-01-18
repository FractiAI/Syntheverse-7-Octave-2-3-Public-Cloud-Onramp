import React from 'react';
import ProfessionalSubmissionExperience from '@/components/ProfessionalSubmissionExperience';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { redirect } from 'next/navigation';

export default async function SubmitPage() {
    const { user } = await getAuthenticatedUserWithRole();

    if (!user) {
        redirect('/login');
    }

    return <ProfessionalSubmissionExperience userEmail={user.email} />;
}

