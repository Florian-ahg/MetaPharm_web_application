'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { KeyRound, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Connexion Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // 2. Vérification du Rôle (Admin ou Pharmacien ?)
      const userId = data.user.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        router.push('/dashboard') 
      } else if (profile.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

    } catch (err) {
      console.error(err)
      setError("Email ou mot de passe incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="text-blue-600" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Espace Pro</CardTitle>
          <CardDescription>
            Connexion réservée aux pharmaciens et administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nom@pharmacie.bj" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Oublié ?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours</> : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Créer un compte
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-800">
              ← Retour au site public
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
