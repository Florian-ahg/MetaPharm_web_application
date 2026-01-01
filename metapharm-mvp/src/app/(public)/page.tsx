'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Navigation, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { mockPharmacies, mockProducts, mockStocks } from '@/lib/mockData'
import { calculateDistance } from '@/lib/utils'
import { toast } from "sonner"

const MapWithNoSSR = dynamic(() => import('@/components/patient/Map'), {
  ssr: false,
  loading: () => <div className="h-[50vh] bg-gray-200 animate-pulse text-center pt-20">Chargement carte...</div>
})

export default function Home() {
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState<any>(null) // { lat: ..., lng: ... }
  const [showOnlyOpen, setShowOnlyOpen] = useState(false)

  // --- 1. FONCTION DE RECHERCHE ---
  const fetchData = async (query = '') => {
    setLoading(true)
    try {
      let dataToDisplay: any[] = []

      if (query === '') {
        // CAS 1 : Recherche vide -> On affiche tout
        const { data, error } = await supabase.from('pharmacies').select('*')
        
        if (!data || data.length === 0 || error) {
           console.log("⚠️ Utilisation des données mockées (Pharmacies)")
           dataToDisplay = mockPharmacies
        } else {
           dataToDisplay = data
        }
      } else {
        // CAS 2 : Recherche médicament -> On cherche qui a du stock
        
        // A. Trouver l'ID du médicament
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .ilike('name', `%${query}%`) // Recherche floue (ex: "doli" trouve "Doliprane")

        // --- LOGIQUE DE RECHERCHE AVEC FALLBACK MOCK ---
        let foundProducts = products
        
        // Si Supabase ne renvoie rien ou plante, on cherche dans le mock
        if (!foundProducts || foundProducts.length === 0) {
           console.log("⚠️ Recherche mockée pour:", query)
           foundProducts = mockProducts.filter(p => 
             p.name.toLowerCase().includes(query.toLowerCase())
           )
        }

        if (foundProducts && foundProducts.length > 0) {
          const productIds = foundProducts.map(p => p.id)
          
          // B. Trouver les stocks correspondants
          let stocks: any[] = []
          const { data: dbStocks } = await supabase
            .from('stocks')
            .select('pharmacy_id, price, pharmacies(*)') // On récupère les infos de la pharmacie liée
            .in('product_id', productIds)
            .eq('available', true)

          if (!dbStocks || dbStocks.length === 0) {
             // Fallback Mock Stocks
             stocks = mockStocks.filter(s => productIds.includes(s.product_id)).map(s => {
                const pharma = mockPharmacies.find(p => p.id === s.pharmacy_id)
                return { ...s, pharmacies: pharma }
             })
          } else {
             stocks = dbStocks
          }

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
      setPharmacies(mockPharmacies)
    } finally {
      setLoading(false)
    }
  }

  // Charger au démarrage
  useEffect(() => { 
    fetchData() 
    
    // Tentative de géolocalisation automatique
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Pas de toast ici pour ne pas spammer au chargement
        },
        (error) => console.log("Géolocalisation auto refusée ou échouée:", error)
      )
    }
  }, [])

  // --- 2. FONCTION GÉOLOCALISATION ---
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }
    
    toast.info("Localisation en cours...")
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        toast.success("Position trouvée !")
      },
      () => toast.error("Impossible de vous localiser. Vérifiez vos permissions GPS.")
    )
  }

  // --- 3. GESTION DE LA RECHERCHE (Touche Entrée) ---
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchData(searchTerm)
    }
  }

  const filteredPharmacies = showOnlyOpen 
    ? pharmacies.filter(p => p.is_on_duty) 
    : pharmacies

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold text-green-700 mb-3">🏥 PharmaBenin</h1>
        
        <div className="flex flex-col gap-3">
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

          {/* Filtres */}
          <div className="flex items-center space-x-2 px-1">
            <Switch 
              id="open-filter" 
              checked={showOnlyOpen}
              onCheckedChange={setShowOnlyOpen}
            />
            <Label htmlFor="open-filter" className="text-sm text-gray-600 cursor-pointer">
              Afficher uniquement les pharmacies de garde (Ouvertes)
            </Label>
          </div>
        </div>
      </div>

      {/* CARTE */}
      <div className="flex-1 relative z-0">
        {/* On passe userLocation à la carte */}
        <MapWithNoSSR pharmacies={filteredPharmacies} userLocation={userLocation} />
      </div>

      {/* RÉSULTATS */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg pb-8 min-h-[200px]">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3"></div>
        <div className="px-4">
          <h2 className="font-semibold text-gray-800 mb-4">
            {searchTerm ? `Résultats pour "${searchTerm}"` : "Pharmacies autour de vous"}
            {showOnlyOpen && <span className="text-green-600 text-sm font-normal ml-2">(Ouvertes uniquement)</span>}
          </h2>

          {loading ? <p className="text-center text-gray-400">Recherche en cours...</p> : (
            <div className="space-y-3">
              {filteredPharmacies.length === 0 && <p className="text-gray-500">Aucune pharmacie trouvée.</p>}
              
              {filteredPharmacies.map((pharma, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{pharma.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} /> {pharma.quartier}
                    </p>
                    {userLocation && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        📍 {calculateDistance(userLocation.lat, userLocation.lng, pharma.lat, pharma.lng)} km
                      </p>
                    )}
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