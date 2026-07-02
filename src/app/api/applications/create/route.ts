import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/mailer'

function makeRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 900000 + 100000)
  return `YP-${year}-${rand}`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { program: programTitle, data: formData } = body
  const reference_number = makeRef()

  // Look up program UUID by title
  const { data: programRow, error: programErr } = await supabase
    .from('programs')
    .select('id')
    .eq('title', programTitle)
    .single()

  if (programErr || !programRow) {
    return NextResponse.json({ error: `Program not found: ${programTitle}` }, { status: 400 })
  }

  const insertPayload: any = {
    user_id: user.id,
    program: programTitle,
    program_id: programRow?.id ?? null,
    data: formData,
    status: 'submitted',
    reference_number: reference_number,
  }

  const { data: inserted, error } = await supabase
    .from('applications')
    .insert([insertPayload])
    .select()
    .single()

  const sendAppEmail = async (recipientEmail: string | undefined) => {
    if (!recipientEmail) return
    await sendEmail({
      to: recipientEmail,
      subject: 'Permohonan anda telah diterima',
      text: `Terima kasih. Permohonan anda untuk ${programTitle} telah diterima. Nombor rujukan anda adalah ${reference_number}.`,
      html: `<p>Assalamualaikum / Salam Sejahtera,</p><p>Permohonan anda untuk <strong>${programTitle}</strong> telah berjaya diterima.</p><p><strong>Nombor rujukan:</strong> ${reference_number}</p><p>Sila semak status permohonan anda melalui portal e-YP.</p>`,
    })
  }

  // If the insert fails because the `program` column doesn't exist in the
  // runtime DB schema (common when migrations/seed weren't applied), try
  // inserting using the `program_id` column instead.
  if (error) {
    const msg = (error.message || '').toLowerCase();
    const programColMissing = /program/.test(msg) && (/does not exist/.test(msg) || /could not find/.test(msg) || /schema cache/.test(msg));
    if (programColMissing && programRow?.id) {
      const { data: inserted2, error: error2 } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          program_id: programRow.id,
          program: programTitle,
          data: formData,
          status: 'submitted',
          reference_number: reference_number,
        }])
        .select()
        .single();

      if (error2) return NextResponse.json({ error: error2.message }, { status: 500 });
      try {
        await sendAppEmail(formData.email ?? user.email ?? undefined)
      } catch (emailError) {
        console.error('Email notification failed on fallback insert:', emailError)
      }
      return NextResponse.json({ application: { ...inserted2, ref: inserted2.reference_number ?? inserted2.ref ?? reference_number } });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await sendAppEmail(formData.email ?? user.email ?? undefined)
  } catch (emailError) {
    console.error('Email notification failed on primary insert:', emailError)
  }
  return NextResponse.json({ application: { ...inserted, ref: inserted.reference_number ?? inserted.ref } })
}
