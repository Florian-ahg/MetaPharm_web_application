'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Navigation } from 'lucide-react' // J'ai ajouté l'icône Navigation
import { supabase } from '@/lib/supabase'

const MapWithNoSSR = dynamic(() => import('@/components/patient/Map'), {
  ssr: false,
  loading: () => <div className="h-[50vh] bg-gray-200 animate-pulse text-center pt-20">Chargement carte...</div>
})

export default function Home() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState(null) // { lat: ..., lng: ... }

  // --- 1. FONCTION DE RECHERCHE ---
  const fetchData = async (query = '') => {
    setLoading(true)
    try {
      let dataToDisplay = []

      if (query === '') {
        // CAS 1 : Recherche vide -> On affiche tout
        const { data, error } = await supabase.from('pharmacies').select('*')
        console.log('🔍 Pharmacies récupérées:', data)
        console.log('❌ Erreur Supabase:', error)
        dataToDisplay = data
      } else {
        // CAS 2 : Recherche médicament -> On cherche qui a du stock
        // Note: Pour un vrai MVP pro, on ferait une "jointure". Ici on fait simple en 2 étapes.
        
        // A. Trouver l'ID du médicament
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .ilike('name', `%${query}%`) // Recherche floue (ex: "doli" trouve "Doliprane")

        if (products.length > 0) {
          const productIds = products.map(p => p.id)
          
          // B. Trouver les stocks correspondants
          const { data: stocks } = await supabase
            .from('stocks')
            .select('pharmacy_id, price, pharmacies(*)') // On récupère les infos de la pharmacie liée
            .in('product_id', productIds)
            .eq('available', true)

          // C. Formater les données pour la carte
          dataToDisplay = stocks.map(item => ({
            ...item.pharmacies, // On étale les infos de la pharma (nom, lat, lng...)
            stock_info: `Dispo à ${item.price} FCFA` // On ajoute une petite info custom
          }))
        }
      }
      console.log('📍 Données à afficher sur la carte:', dataToDisplay)
      setPharmacies(dataToDisplay || [])
    } catch (error) {
      console.error('💥 Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger au démarrage
  useEffect(() => { fetchData() }, [])

  // --- 2. FONCTION GÉOLOCALISATION ---
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => alert("Impossible de vous localiser. Vérifiez vos permissions GPS.")
    )
  }

  // --- 3. GESTION DE LA RECHERCHE (Touche Entrée) ---
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchData(searchTerm)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold text-green-700 mb-3">🏥 PharmaBenin</h1>
        
        <div className="flex gap-2">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Chercher: Doliprane, Coartem..." 
              className="w-full p-3 pl-10 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          
          {/* Bouton Géolocalisation */}
          <button 
            onClick={handleLocateMe}
            className="bg-green-100 p-3 rounded-xl text-green-700 hover:bg-green-200 transition-colors"
          >
            <Navigation size={24} />
          </button>
        </div>
      </div>

      {/* CARTE */}
      <div className="flex-1 relative z-0">
        {/* On passe userLocation à la carte */}
        <MapWithNoSSR pharmacies={pharmacies} userLocation={userLocation} />
      </div>

      {/* RÉSULTATS */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg pb-8 min-h-[200px]">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3"></div>
        <div className="px-4">
          <h2 className="font-semibold text-gray-800 mb-4">
            {searchTerm ? `Résultats pour "${searchTerm}"` : "Pharmacies autour de vous"}
          </h2>

          {loading ? <p className="text-center text-gray-400">Recherche en cours...</p> : (
            <div className="space-y-3">
              {pharmacies.length === 0 && <p className="text-gray-500">Aucune pharmacie trouvée pour ce médicament.</p>}
              
              {pharmacies.map((pharma, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{pharma.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} /> {pharma.quartier}
                    </p>
                    {/* Affiche le prix si on a fait une recherche produit */}
                    {pharma.stock_info && (
                      <span className="text-green-700 font-bold text-sm bg-green-50 px-2 py-1 rounded mt-1 inline-block">
                        {pharma.stock_info}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${pharma.is_on_duty ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {pharma.is_on_duty ? 'OUVERT' : 'FERMÉ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}