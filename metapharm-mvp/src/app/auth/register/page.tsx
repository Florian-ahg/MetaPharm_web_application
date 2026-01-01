'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    pharmacyName: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    try {
      // 1. Inscription Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            pharmacy_name: formData.pharmacyName,
            role: 'pharmacist' // Par défaut, on inscrit des pharmaciens ici
          }
        }
      })

      if (authError) throw authError

      if (data.user) {
        // 2. Création du profil dans la table 'profiles' (si nécessaire, selon votre logique backend)
        // Note: Idéalement, un trigger Supabase gère ça, mais on peut le faire ici si besoin.
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name: formData.fullName,
              role: 'pharmacist',
              email: formData.email
            }
          ])
        
        if (profileError) {
            console.error("Erreur création profil:", profileError)
            // On continue quand même, l'auth a marché
        }

        toast.success("Compte créé avec succès ! Veuillez vérifier votre email.")
        router.push('/auth/login')
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Une erreur est survenue lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <UserPlus className="text-green-600" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Créer un compte Pro</CardTitle>
          <CardDescription>
            Rejoignez le réseau MetaPharm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Dr. Jean Dupont" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacyName">Nom de la pharmacie</Label>
              <Input 
                id="pharmacyName" 
                type="text" 
                placeholder="Pharmacie de la Paix" 
                required
                value={formData.pharmacyName}
                onChange={(e) => setFormData({...formData, pharmacyName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contact@pharmacie.bj" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-green-600 hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
