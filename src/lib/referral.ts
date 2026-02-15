import { createClient } from '@/lib/supabase/client'

// Generate a unique 8-char referral code like LARDIA-XXXX
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `LARDIA-${code}`
}

// Build the full referral share link
export function getReferralLink(code: string): string {
  return `https://lardia.vercel.app/?ref=${code}`
}

// Build WhatsApp share URL with pre-filled Portuguese message
export function getWhatsAppShareUrl(code: string): string {
  const link = getReferralLink(code)
  const message = `Oi! Uso a LarDia para cuidar do eSocial da minha empregada doméstica e facilita muito. Cadastre-se com meu link e ganhe benefícios: ${link}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

// Ensure the employer has a referral code, generating one if needed
export async function ensureReferralCode(employerId: string): Promise<string | null> {
  const supabase = createClient()

  const { data: employer } = await supabase
    .from('employers')
    .select('referral_code')
    .eq('id', employerId)
    .single()

  if (employer?.referral_code) {
    return employer.referral_code
  }

  // Generate and save a new code (retry on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode()
    const { error } = await supabase
      .from('employers')
      .update({ referral_code: code })
      .eq('id', employerId)

    if (!error) return code
  }

  return null
}

// Track a referral: called when a new user signs up with a ref code
export async function trackReferral(referralCode: string, refereeEmployerId: string): Promise<void> {
  const supabase = createClient()

  // Find the referrer by code
  const { data: referrer } = await supabase
    .from('employers')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!referrer) return

  // Don't allow self-referral
  if (referrer.id === refereeEmployerId) return

  // Check if already tracked
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.id)
    .eq('referee_id', refereeEmployerId)
    .single()

  if (existing) return

  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referee_id: refereeEmployerId,
    referral_code: referralCode,
    status: 'pending',
  })
}

// Get referral stats for an employer
export async function getReferralStats(employerId: string) {
  const supabase = createClient()

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, status, created_at, completed_at')
    .eq('referrer_id', employerId)
    .order('created_at', { ascending: false })

  const all = referrals || []
  const invited = all.length
  const joined = all.filter(r => r.status === 'completed' || r.status === 'rewarded').length
  const monthsEarned = all.filter(r => r.status === 'rewarded').length

  return { referrals: all, invited, joined, monthsEarned }
}
