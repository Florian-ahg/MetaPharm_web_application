'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Navigation, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'

const MapWithNoSSR = dynamic(() => import('@/components/patient/Map'), {
  ssr: false,
  loading: () => <div className="h-[50vh] bg-gray-200 animate-pulse text-center pt-20">Chargement carte...</div>
})

export default function SearchPage() {
  const { addToCart, setIsCartOpen, cart } = useCart()
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState(null)

  const fetchData = async (query = '') => {
    setLoading(true)
    try {
      let dataToDisplay = []

      if (query === '') {
        const { data, error } = await supabase.from('pharmacies').select('*')
        console.log('🔍 Pharmacies récupérées:', data)
        console.log('❌ Erreur Supabase:', error)
        dataToDisplay = data
      } else {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .ilike('name', `%${query}%`)

        if (products.length > 0) {
          const productIds = products.map(p => p.id)
          
          const { data: stocks } = await supabase
            .from('stocks')
            .select('pharmacy_id, price, product_id, pharmacies(*)')
            .in('product_id', productIds)
            .eq('available', true)

          dataToDisplay = stocks.map(item => ({
            ...item.pharmacies,
            stock_info: `Dispo à ${item.price} FCFA`,
            price: item.price,
            product_id: item.product_id
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

  useEffect(() => { fetchData() }, [])

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

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchData(searchTerm)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold text-green-700 mb-3">🏥 MetaPharm</h1>
        
        <div className="flex gap-2">
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
          
          <button 
            onClick={handleLocateMe}
            className="bg-green-100 p-3 rounded-xl text-green-700 hover:bg-green-200 transition-colors"
          >
            <Navigation size={24} />
          </button>
        </div>
      </div>

      {/* Bouton panier flottant */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-green-700 text-white p-4 rounded-full shadow-xl flex items-center gap-2 hover:bg-green-800 transition-colors"
      >
        <ShoppingCart />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cart.length}
          </span>
        )}
      </button>

      {/* CARTE */}
      <div className="flex-1 relative z-0">
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
                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{pharma.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} /> {pharma.quartier}
                      </p>
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
                  
                  {/* Bouton Ajouter au panier si produit trouvé */}
                  {pharma.stock_info && searchTerm && (
                    <div className="mt-3 flex justify-between items-center border-t pt-2">
                      <span className="font-bold text-green-700">{pharma.stock_info}</span>
                      <button 
                        onClick={() => addToCart(
                          { id: pharma.product_id, name: searchTerm },
                          pharma,
                          pharma.price
                        )}
                        className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                      >
                        + Ajouter au panier
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
