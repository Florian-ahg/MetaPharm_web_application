'use client'
import { useState } from 'react'
import { createPharmacyAndUser } from '@/actions/admin' // On importe notre Server Action
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Plus, Copy } from 'lucide-react'

export default function AdminDashboard() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Gestion du formulaire
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.target)
    
    // Appel au serveur
    const response = await createPharmacyAndUser(formData)
    
    setResult(response)
    setLoading(false)
    if(response.success) event.target.reset() // Vider le formulaire si succès
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3 text-blue-900">
          <ShieldCheck size={40} />
          <h1 className="text-3xl font-bold">Espace Super-Admin</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* --- COLONNE GAUCHE : Formulaire de création --- */}
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Plus size={20}/> Nouvelle Pharmacie Partenaire
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Nom de la Pharmacie</Label>
                  <Input name="pharmacyName" placeholder="Ex: Pharmacie de la Gare" required />
                </div>

                <div className="space-y-2">
                  <Label>Nom du Pharmacien Responsable</Label>
                  <Input name="fullName" placeholder="Ex: Dr. Tunde" required />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 space-y-3">
                  <h3 className="font-semibold text-yellow-800 text-sm">Identifiants de connexion</h3>
                  <div className="space-y-2">
                    <Label>Email pro (Login)</Label>
                    <Input name="email" type="email" placeholder="contact@pharmagare.bj" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe provisoire</Label>
                    <Input name="password" type="text" defaultValue="Pharma2025!" required />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
                  {loading ? 'Création en cours...' : 'Créer la pharmacie & Envoyer'}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* --- COLONNE DROITE : Résultat & Instructions --- */}
          <div className="space-y-6">
            {result && (
              <div className={`p-6 rounded-xl border ${result.success ? 'bg-green-100 border-green-300 text-green-900' : 'bg-red-100 border-red-300 text-red-900'}`}>
                <h3 className="font-bold mb-2">{result.success ? '✅ Succès !' : '❌ Erreur'}</h3>
                <p>{result.message}</p>
                {result.success && (
                  <p className="text-sm mt-4 text-gray-600 italic">
                    💡 Astuce : Copiez ces infos et envoyez-les par WhatsApp ou Mail au pharmacien.
                  </p>
                )}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Liste des Pharmacies (Aperçu)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Aucune pharmacie pour l'instant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
