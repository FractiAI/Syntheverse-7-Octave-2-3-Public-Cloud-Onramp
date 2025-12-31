import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { desc, eq } from 'drizzle-orm'
import { debug } from '@/utils/debug'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')

  const url = new URL(request.url)
  const limitRaw = url.searchParams.get('limit')
  const limit = Math.max(1, Math.min(20, Number(limitRaw || 6) || 6))

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ items: [] as any[] }, { headers })
    }

    const rows = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        metals: contributionsTable.metals,
        metadata: contributionsTable.metadata,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .where(eq(contributionsTable.status, 'qualified'))
      .orderBy(desc(contributionsTable.created_at))
      .limit(limit)

    const items = rows.map((r) => {
      const md: any = (r.metadata as any) || {}
      return {
        submission_hash: r.submission_hash,
        title: r.title,
        contributor: r.contributor,
        metals: (r.metals as any) || null,
        pod_score: typeof md.pod_score === 'number' ? md.pod_score : md.pod_score ? Number(md.pod_score) : null,
        qualified_epoch: md.qualified_epoch ? String(md.qualified_epoch) : null,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }
    })

    return NextResponse.json({ items }, { headers })
  } catch (err) {
    debug('PublicQualifiers', 'Failed to fetch qualifiers', err)
    return NextResponse.json({ items: [] as any[], error: 'Failed to fetch qualifiers' }, { headers, status: 200 })
  }
}


