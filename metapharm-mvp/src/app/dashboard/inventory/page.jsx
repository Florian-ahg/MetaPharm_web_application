'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Loader2 } from 'lucide-react'
// Assurez-vous que le chemin est bon pour votre projet
import AddProductModal from '@/components/dashboard/AddProductModal'

export default function InventoryPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- NOUVELLE LOGIQUE DE CHARGEMENT DYNAMIQUE ---
  const fetchInventory = async () => {
    setLoading(true)
    try {
      // 1. Qui est connecté ?
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return // Pas connecté

      // 2. À quelle pharmacie appartient-il ?
      const { data: profile } = await supabase
        .from('profiles')
        .select('pharmacy_id')
        .eq('id', user.id)
        .single()

      if (!profile?.pharmacy_id) {
        console.error("Aucune pharmacie liée à ce compte")
        return
      }

      // 3. Charger le stock de CETTE pharmacie spécifique
      const { data, error } = await supabase
        .from('stocks')
        .select(`
          id,
          price,
          available,
          products ( id, name, image_url )
        `)
        .eq('pharmacy_id', profile.pharmacy_id) // <--- C'est ici que ça change ! (Avant c'était '1')
        .order('id', { ascending: false }) // Les derniers ajouts en haut (optionnel)
      
      if (error) throw error
      setStocks(data)

    } catch (error) {
      console.error('Erreur stock:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le statut (En Stock <-> Rupture)
  const toggleStock = async (stockId, currentStatus) => {
    setStocks(stocks.map(item => 
      item.id === stockId ? { ...item, available: !currentStatus } : item
    ))

    await supabase
      .from('stocks')
      .update({ available: !currentStatus })
      .eq('id', stockId)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const filteredStocks = stocks.filter(item => 
    item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestion du Stock</h2>
          <p className="text-gray-500">Gérez la disponibilité de vos médicaments en temps réel.</p>
        </div>
        
        {/* On passe la fonction de rechargement au modal */}
        <AddProductModal onProductAdded={fetchInventory} />
      </div>

      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un médicament..."
            className="pl-8 w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchInventory}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Médicament</TableHead>
              <TableHead>Prix (FCFA)</TableHead>
              <TableHead>État du stock</TableHead>
              <TableHead className="text-right">Action Rapide</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center">
                   <div className="flex justify-center items-center gap-2 text-gray-500">
                     <Loader2 className="animate-spin h-5 w-5" /> Chargement...
                   </div>
                 </TableCell>
               </TableRow>
            ) : filteredStocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  Votre stock est vide. Ajoutez votre premier produit !
                </TableCell>
              </TableRow>
            ) : (
              filteredStocks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-base">{item.products?.name}</span>
                      <span className="text-xs text-gray-400">Réf: #PROD-{item.products?.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.price} F</TableCell>
                  <TableCell>
                    {item.available ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">En Stock</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Rupture</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <label className="text-xs text-gray-400 mr-2">{item.available ? 'Désactiver' : 'Activer'}</label>
                      <Switch 
                        checked={item.available}
                        onCheckedChange={() => toggleStock(item.id, item.available)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}