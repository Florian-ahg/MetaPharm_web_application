'use client'
import { useState, useEffect } from 'react'
import { createPharmacyAndUser } from '@/actions/admin'
import { supabase } from '@/lib/supabase' // On importe Supabase pour lire la liste
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Plus, Store, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner' // Optionnel si vous avez installé sonner, sinon utilisez alert()

export default function AdminDashboard() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // État pour stocker la liste des pharmacies
  const [pharmaciesList, setPharmaciesList] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  // --- 1. FONCTION POUR CHARGER LA LISTE ---
  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false }) // Les plus récentes en haut

      if (error) throw error
      setPharmaciesList(data || [])
    } catch (error) {
      console.error("Erreur chargement liste:", error)
    } finally {
      setLoadingList(false)
    }
  }

  // Charger la liste au démarrage de la page
  useEffect(() => {
    fetchPharmacies()
  }, [])

  // --- 2. GESTION DU FORMULAIRE (CRÉATION) ---
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.target)
    
    // Appel au serveur (Server Action)
    const response = await createPharmacyAndUser(formData)
    
    setResult(response)
    setLoading(false)

    if(response.success) {
      event.target.reset() // Vider le formulaire
      fetchPharmacies() // 🔄 RAFRAÎCHIR LA LISTE AUTOMATIQUEMENT
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex items-center gap-3 text-blue-900 border-b pb-4">
          <ShieldCheck size={32} />
          <h1 className="text-2xl md:text-3xl font-bold">Espace Super-Admin</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* --- COLONNE GAUCHE : Formulaire de création --- */}
          <Card className="shadow-lg border-blue-100 h-fit">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Plus size={20}/> Nouvelle Pharmacie Partenaire
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Affichage du résultat (Succès/Erreur) */}
                {result && (
                  <div className={`p-4 rounded-lg border text-sm ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <p className="font-bold">{result.success ? '✅ Succès !' : '❌ Erreur'}</p>
                    <p>{result.message}</p>
                  </div>
                )}

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
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Création...</>
                  ) : 'Créer la pharmacie & Envoyer'}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* --- COLONNE DROITE : Liste des Pharmacies --- */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Store size={24} /> Liste des Pharmacies ({pharmaciesList.length})
            </h2>

            {loadingList ? (
               <div className="text-center py-10 text-gray-400">
                 <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2"/> Chargement...
               </div>
            ) : (
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                {pharmaciesList.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      Aucune pharmacie enregistrée pour l'instant.
                    </CardContent>
                  </Card>
                ) : (
                  pharmaciesList.map((pharma) => (
                    <Card key={pharma.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-900">{pharma.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={12}/> {pharma.quartier || 'Cotonou'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pharma.is_on_duty ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {pharma.is_on_duty ? 'DE GARDE' : 'FERMÉE'}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: #{pharma.id}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}