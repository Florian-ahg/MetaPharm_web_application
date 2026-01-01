'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Phone, MapPin, Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SalesPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [myPharmacyId, setMyPharmacyId] = useState(null) // Nouvel état pour stocker l'ID de ma pharmacie

  // --- 0. RÉCUPÉRER L'ID DE LA PHARMACIE CONNECTÉE ---
  useEffect(() => {
    const getPharmacyId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('pharmacy_id')
          .eq('id', user.id)
          .single()
        
        if (profile?.pharmacy_id) {
          setMyPharmacyId(profile.pharmacy_id)
        }
      }
    }
    getPharmacyId()
  }, [])


  // --- 1. FONCTION DE CHARGEMENT DES COMMANDES ---
  const fetchOrders = async () => {
    if (!myPharmacyId) return // Attendre d'avoir l'ID de ma pharmacie
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            quantity,
            unit_price,
            products ( name )
          )
        `)
        .eq('pharmacy_id', myPharmacyId) // <--- C'est ici que ça change : ID dynamique !
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data)
    } catch (error) {
      console.error("Erreur chargement commandes:", error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Écouter les nouvelles commandes en TEMPS RÉEL (s'active une fois qu'on a myPharmacyId)
  useEffect(() => {
    if (!myPharmacyId) return // Ne pas s'abonner tant qu'on n'a pas l'ID

    fetchOrders() // Charger une première fois avec le bon ID

    // On s'abonne aux changements sur la table 'sales'
    const channel = supabase
      .channel(`realtime:sales:${myPharmacyId}`) // Nom du canal unique par pharmacie
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales' }, (payload) => {
        // Si une nouvelle commande arrive pour MA pharmacie
        if (payload.new.pharmacy_id === myPharmacyId) { // Vérification avec ID dynamique
          toast.message("🔔 Nouvelle commande reçue !", {
            description: "Un client vient de valider un panier."
          })
          fetchOrders() // On recharge la liste
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [myPharmacyId]) // <--- Dépendance clé : se déclenche quand myPharmacyId est connu


  // 3. Action : Changer le statut (reste inchangé)
  const updateStatus = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    const { error } = await supabase
      .from('sales')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      toast.error("Erreur lors de la mise à jour")
      fetchOrders()
    } else {
      toast.success(`Commande passée en : ${getStatusLabel(newStatus)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Commandes & Livraisons</h2>
          <p className="text-gray-500">Suivez les commandes entrantes en temps réel.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-green-200 bg-green-50 text-green-700">
          🟢 Live Connexion active
        </Badge>
      </div>

      {loading || !myPharmacyId ? (
        <div className="text-center py-20">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">Chargement des commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune commande</h3>
          <p className="mt-1 text-sm text-gray-500">Les commandes apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}

// ... Le composant OrderCard et la fonction getStatusLabel restent inchangés ...
function OrderCard({ order, onUpdateStatus }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-blue-100 text-blue-800 border-blue-200",
    delivering: "bg-purple-100 text-purple-800 border-purple-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  }

  return (
    <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge className={`${statusColors[order.status] || "bg-gray-100"} hover:bg-opacity-80`}>
            {getStatusLabel(order.status)}
          </Badge>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <CardTitle className="text-lg mt-2">Commande #{order.id}</CardTitle>
        <CardDescription className="flex flex-col gap-1 mt-1">
          <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <Phone size={14} /> {order.customer_phone}
          </span>
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={14} /> {order.delivery_address}
          </span>
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 py-4">
        <div className="space-y-2">
          {order.sale_items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.products?.name}</span>
              <span className="font-medium">{item.unit_price * item.quantity} F</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between font-bold text-lg pt-2 border-t border-dashed">
          <span>Total</span>
          <span className="text-green-700">{order.total_amount} FCFA</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        {order.status === 'pending' && (
          <>
            <Button 
              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-100" 
              variant="outline"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
            >
              Refuser
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={() => onUpdateStatus(order.id, 'accepted')}
            >
              Accepter
            </Button>
          </>
        )}
        
        {order.status === 'accepted' && (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            onClick={() => onUpdateStatus(order.id, 'delivering')}
          >
            <Package className="mr-2 h-4 w-4" /> Remettre au Livreur
          </Button>
        )}

        {order.status === 'delivering' && (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => onUpdateStatus(order.id, 'completed')}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Confirmer Livraison
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function getStatusLabel(status) {
  switch (status) {
    case 'pending': return '⏳ En attente'
    case 'accepted': return ' En phase de Préparation' // Correction de faute de frappe ici
    case 'delivering': return ' En Livraison'
    case 'completed': return '✅ Livré'
    case 'cancelled': return '❌ Annulé'
    default: return status
  }
}