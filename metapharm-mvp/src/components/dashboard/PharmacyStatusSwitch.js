'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PharmacyStatusSwitch() {
  const [isOnDuty, setIsOnDuty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pharmacyId, setPharmacyId] = useState(null)

  // 1. Charger l'état actuel au démarrage
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('pharmacy_id')
          .eq('id', user.id)
          .single()

        if (profile?.pharmacy_id) {
          setPharmacyId(profile.pharmacy_id)
          
          const { data: pharma } = await supabase
            .from('pharmacies')
            .select('is_on_duty')
            .eq('id', profile.pharmacy_id)
            .single()
            
          if (pharma) setIsOnDuty(pharma.is_on_duty)
        }
      } catch (error) {
        console.error("Erreur chargement statut:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  // 2. Changer l'état (Toggle)
  const handleToggle = async (checked) => {
    // Changement visuel immédiat (Optimistic UI)
    setIsOnDuty(checked)
    
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({ is_on_duty: checked })
        .eq('id', pharmacyId)

      if (error) throw error
      
      if (checked) {
        toast.success("Pharmacie OUVERTE ✅", { description: "Vous êtes visible sur la carte." })
      } else {
        toast.info("Pharmacie FERMÉE 💤", { description: "Vous n'apparaissez plus comme 'De garde'." })
      }

    } catch (error) {
      console.error(error)
      setIsOnDuty(!checked) // On revient en arrière si erreur
      toast.error("Erreur lors de la mise à jour")
    }
  }

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />

  return (
    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <Switch 
        id="pharma-status" 
        checked={isOnDuty}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-600"
      />
      <Label htmlFor="pharma-status" className="cursor-pointer flex items-center gap-2 font-medium text-sm">
        {isOnDuty ? (
          <span className="text-green-700 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            EN SERVICE
          </span>
        ) : (
          <span className="text-gray-500">FERMÉ</span>
        )}
      </Label>
    </div>
  )
}
