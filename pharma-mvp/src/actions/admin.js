'use server'

import { createClient } from '@supabase/supabase-js'

// On crée un client Supabase avec les droits SUPER ADMIN (Backend uniquement)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createPharmacyAndUser(formData) {
  const pharmacyName = formData.get('pharmacyName')
  const email = formData.get('email')
  const password = formData.get('password') // L'admin définit un mot de passe initial
  const fullName = formData.get('fullName')

  try {
    // 1. Créer l'utilisateur Auth (sans envoyer de mail de confirm pour le MVP)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // On valide automatiquement l'email
      user_metadata: { full_name: fullName }
    })

    if (authError) throw new Error("Erreur Auth: " + authError.message)
    const userId = authData.user.id

    // 2. Créer la Pharmacie
    const { data: pharmaData, error: pharmaError } = await supabaseAdmin
      .from('pharmacies')
      .insert([{ 
        name: pharmacyName, 
        lat: 6.3654, 
        lng: 2.4183, 
        is_on_duty: false 
      }])
      .select()
      .single()

    if (pharmaError) throw new Error("Erreur Pharma: " + pharmaError.message)

    // 3. Créer le Profil et lier les deux
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        pharmacy_id: pharmaData.id,
        role: 'pharmacist', // Rôle standard
        full_name: fullName
      }])

    if (profileError) throw new Error("Erreur Profil: " + profileError.message)

    return { success: true, message: `Pharmacie créée ! Envoyez ces accès : ${email} / ${password}` }

  } catch (error) {
    return { success: false, message: error.message }
  }
}
