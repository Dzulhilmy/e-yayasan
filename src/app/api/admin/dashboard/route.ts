// src/app/api/admin/dashboard/route.ts
// Real aggregate stats + recent applications for the admin dashboard.
// Replaces the hardcoded `stats` array and the 5x repeated mock row.

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, meta')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = profile?.is_admin === true || (profile?.meta as any)?.is_admin === true
  if (!isAdmin) return { ok: false as const, status: 403 }

  return { ok: true as const, supabase }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  const { supabase } = auth

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Applications created in the last 30 days (for "Permohonan Baru")
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

  // Pending applications (status not approved/rejected)
  const { count: pendingCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .not('status', 'in', '(diluluskan,approved,ditolak,rejected)')

  // Total disbursed amount — sums the `data->>amount` field if you store
  // it that way; adjust the column path to match your actual schema.
  const { data: approvedApps } = await supabase
    .from('applications')
    .select('data')
    .in('status', ['diluluskan', 'approved'])

  const totalDisbursed = (approvedApps ?? []).reduce((sum, app) => {
    const amt = parseFloat(String(app.data?.amount ?? '0').replace(/[^\d.]/g, ''))
    return sum + (isNaN(amt) ? 0 : amt)
  }, 0)

  // 5 most recent applications, joined with applicant name
  const { data: recent } = await supabase
    .from('applications')
    .select('id, program, status, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers ?? 0,
      newApplications: newApplications ?? 0,
      totalDisbursed,
      pendingCount: pendingCount ?? 0,
    },
    recentApplications: (recent ?? []).map((a: any) => ({
      id: a.id,
      applicantName: a.profiles?.full_name ?? 'Pemohon',
      program: a.program,
      status: a.status,
      createdAt: a.created_at,
    })),
  })
}