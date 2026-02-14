import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Called when a referee subscribes: reward the referrer with 1 free month
export async function POST(request: Request) {
  try {
    const { refereeEmployerId } = await request.json()
    if (!refereeEmployerId) {
      return NextResponse.json({ error: 'Missing refereeEmployerId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find pending referral for this referee
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referee_id', refereeEmployerId)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      return NextResponse.json({ message: 'No pending referral found' })
    }

    // Mark as completed
    await supabase
      .from('referrals')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', referral.id)

    // Add bonus month to referrer
    const { data: referrer } = await supabase
      .from('employers')
      .select('referral_bonus_months')
      .eq('id', referral.referrer_id)
      .single()

    const currentMonths = referrer?.referral_bonus_months || 0
    await supabase
      .from('employers')
      .update({ referral_bonus_months: currentMonths + 1 })
      .eq('id', referral.referrer_id)

    // Mark referral as rewarded
    await supabase
      .from('referrals')
      .update({ status: 'rewarded' })
      .eq('id', referral.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
