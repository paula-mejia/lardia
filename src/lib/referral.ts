import { createClient } from '@/lib/supabase/client'

/**
 * Generate a unique 8-character referral code (e.g., LARDIA-A3K7).
 * Uses alphanumeric characters excluding ambiguous ones (0, O, 1, I, L).
 * @returns Referral code string in format LARDIA-XXXX
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `LARDIA-${code}`
}

/**
 * Build the full referral share link for a given code.
 * @param code - The referral code (e.g., LARDIA-A3K7)
 * @returns Full URL with ?ref= query parameter
 */
export function getReferralLink(code: string): string {
  return `https://lardia.vercel.app/?ref=${code}`
}

/**
 * Build a WhatsApp share URL with a pre-filled Portuguese referral message.
 * @param code - The referral code
 * @returns wa.me URL with encoded message text
 */
export function getWhatsAppShareUrl(code: string): string {
  const link = getReferralLink(code)
  const message = `Oi! Uso a LarDia para cuidar do eSocial da minha empregada doméstica e facilita muito. Cadastre-se com meu link e ganhe benefícios: ${link}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/**
 * Ensure the employer has a referral code, generating one if needed.
 * Retries up to 5 times on code collision.
 * @param employerId - Supabase employer ID
 * @returns The referral code, or null if generation failed
 */
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

/**
 * Track a referral when a new user signs up with a referral code.
 * Prevents self-referral and duplicate tracking.
 * @param referralCode - The referral code used during signup
 * @param refereeEmployerId - The new user's employer ID
 */
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

/**
 * Get referral statistics for an employer (invited, joined, months earned).
 * @param employerId - Supabase employer ID
 * @returns Object with referrals array and summary counts
 */
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
