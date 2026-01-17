/**
 * Constants and Equations API
 * Lists all novel constants and equations extracted from qualified PoC submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { pocLogTable, contributionsTable, enterpriseContributionsTable } from '@/utils/db/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface ConstantEquation {
  id: string;
  value: string;
  type: 'constant' | 'equation';
  description?: string;
  source_title: string;
  source_hash: string;
  source_contributor: string;
  first_seen: string;
  usage_count: number;
}

/**
 * Process archive data and extract constants/equations
 */
function processArchiveData(
  archiveData: { abstract?: string; formulas?: string[]; constants?: string[] },
  title: string,
  submissionHash: string,
  contributor: string,
  createdAt: Date | null,
  allConstants: Map<string, ConstantEquation>,
  allEquations: Map<string, ConstantEquation>
) {
  // Get abstract for description
  const abstract = archiveData.abstract || '';
  const description = abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract;

  // Process constants
  if (Array.isArray(archiveData.constants)) {
    archiveData.constants.forEach((constant: string) => {
      if (constant && constant.trim().length > 0) {
        const key = constant.trim().toLowerCase();
        if (!allConstants.has(key)) {
          allConstants.set(key, {
            id: `const_${allConstants.size}`,
            value: constant.trim(),
            type: 'constant',
            description: description || undefined,
            source_title: title,
            source_hash: submissionHash,
            source_contributor: contributor,
            first_seen: createdAt?.toISOString() || new Date().toISOString(),
            usage_count: 1,
          });
        } else {
          const existing = allConstants.get(key)!;
          existing.usage_count++;
        }
      }
    });
  }

  // Process equations/formulas
  if (Array.isArray(archiveData.formulas)) {
    archiveData.formulas.forEach((formula: string) => {
      if (formula && formula.trim().length > 0) {
        const key = formula.trim().toLowerCase();
        if (!allEquations.has(key)) {
          allEquations.set(key, {
            id: `eq_${allEquations.size}`,
            value: formula.trim(),
            type: 'equation',
            description: description || undefined,
            source_title: title,
            source_hash: submissionHash,
            source_contributor: contributor,
            first_seen: createdAt?.toISOString() || new Date().toISOString(),
            usage_count: 1,
          });
        } else {
          const existing = allEquations.get(key)!;
          existing.usage_count++;
        }
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const allConstants: Map<string, ConstantEquation> = new Map();
    const allEquations: Map<string, ConstantEquation> = new Map();

    // Extract from public contributions (via poc_log.metadata.archive_data)
    const qualifiedContributions = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .where(eq(contributionsTable.status, 'qualified'));

    for (const contribution of qualifiedContributions) {
      const logEntry = await db
        .select({
          metadata: pocLogTable.metadata,
        })
        .from(pocLogTable)
        .where(
          and(
            eq(pocLogTable.submission_hash, contribution.submission_hash),
            eq(pocLogTable.event_type, 'evaluation_complete')
          )
        )
        .limit(1);

      if (logEntry.length > 0 && logEntry[0].metadata) {
        const archiveData = (logEntry[0].metadata as any).archive_data;
        if (archiveData) {
          processArchiveData(
            archiveData,
            contribution.title,
            contribution.submission_hash,
            contribution.contributor,
            contribution.created_at,
            allConstants,
            allEquations
          );
        }
      }
    }

    // Extract from enterprise contributions (via metadata.archive_data)
    const qualifiedEnterpriseContributions = await db
      .select({
        submission_hash: enterpriseContributionsTable.submission_hash,
        title: enterpriseContributionsTable.title,
        contributor: enterpriseContributionsTable.contributor,
        metadata: enterpriseContributionsTable.metadata,
        created_at: enterpriseContributionsTable.created_at,
      })
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.status, 'qualified'));

    for (const contribution of qualifiedEnterpriseContributions) {
      // Check if archive_data is stored in metadata (for enterprise, it might be in metadata directly)
      const metadata = (contribution.metadata as any) || {};
      const archiveData = metadata.archive_data;
      
      if (archiveData) {
        processArchiveData(
          archiveData,
          contribution.title,
          contribution.submission_hash,
          contribution.contributor,
          contribution.created_at,
          allConstants,
          allEquations
        );
      } else {
        // Also check poc_log for enterprise contributions (if they're logged there)
        const logEntry = await db
          .select({
            metadata: pocLogTable.metadata,
          })
          .from(pocLogTable)
          .where(
            and(
              eq(pocLogTable.submission_hash, contribution.submission_hash),
              eq(pocLogTable.event_type, 'evaluation_complete')
            )
          )
          .limit(1);

        if (logEntry.length > 0 && logEntry[0].metadata) {
          const logArchiveData = (logEntry[0].metadata as any).archive_data;
          if (logArchiveData) {
            processArchiveData(
              logArchiveData,
              contribution.title,
              contribution.submission_hash,
              contribution.contributor,
              contribution.created_at,
              allConstants,
              allEquations
            );
          }
        }
      }
    }

    // Convert maps to arrays and sort by first_seen (most recent first)
    const constants = Array.from(allConstants.values()).sort(
      (a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime()
    );
    const equations = Array.from(allEquations.values()).sort(
      (a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime()
    );

    return NextResponse.json({
      constants,
      equations,
      total_constants: constants.length,
      total_equations: equations.length,
    });
  } catch (error: any) {
    console.error('Error fetching constants and equations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch constants and equations',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

