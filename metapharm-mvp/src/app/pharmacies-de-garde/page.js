'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Clock, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { mockPharmacies } from '@/lib/mockData'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { calculateDistance } from '@/lib/utils'
import { toast } from "sonner"

const MapWithNoSSR = dynamic(() => import('@/components/patient/Map'), {
  ssr: false,
  loading: () => <div className="h-[50vh] bg-gray-200 animate-pulse text-center pt-20">Chargement carte...</div>
})

export default function PharmaciesDeGardePage() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)

  const fetchPharmacies = async () => {
    setLoading(true)
    try {
      // On cherche les pharmacies de garde
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_on_duty', true)

      if (!data || data.length === 0 || error) {
         console.log("⚠️ Utilisation des données mockées (Pharmacies de garde)")
         // Filtrer les mocks pour n'avoir que celles de garde
         setPharmacies(mockPharmacies.filter(p => p.is_on_duty))
      } else {
         setPharmacies(data)
      }
    } catch (error) {
      console.error('💥 Erreur:', error)
      setPharmacies(mockPharmacies.filter(p => p.is_on_duty))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchPharmacies() 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.log("Géolocalisation auto refusée ou échouée:", error)
      )
    }
  }, [])

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

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* HEADER */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/">
                <Button variant="ghost" size="sm">← Retour</Button>
            </Link>
            <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
                <Clock size={24} /> Pharmacies de Garde
            </h1>
        </div>
        
        <button 
          onClick={handleLocateMe}
          className="bg-green-100 p-2 rounded-xl text-green-700 hover:bg-green-200 transition-colors"
          title="Me localiser"
        >
          <Navigation size={20} />
        </button>
      </div>

      {/* CARTE */}
      <div className="flex-1 relative z-0 h-[40vh] min-h-[300px]">
        <MapWithNoSSR pharmacies={pharmacies} userLocation={userLocation} />
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 shadow-lg pb-8 flex-1">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3"></div>
        <div className="px-4 container mx-auto max-w-2xl">
          <h2 className="font-semibold text-gray-800 mb-4 text-center">
            Pharmacies ouvertes actuellement
          </h2>

          {loading ? (
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>
                ))}
            </div>
          ) : (
            <div className="space-y-3">
              {pharmacies.length === 0 && <p className="text-gray-500 text-center">Aucune pharmacie de garde trouvée.</p>}
              
              {pharmacies.map((pharma, index) => (
                <div key={index} className="p-4 border border-green-100 rounded-2xl bg-green-50/30 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{pharma.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin size={14} className="text-green-600" /> {pharma.quartier}
                    </p>
                    {userLocation && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        📍 {calculateDistance(userLocation.lat, userLocation.lng, pharma.lat, pharma.lng)} km
                      </p>
                    )}
                    {pharma.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone size={14} /> {pharma.phone}
                        </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm animate-pulse">
                      OUVERT
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
