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
import { Search, Plus, RefreshCw, Loader2 } from 'lucide-react'
import AddProductModal from '@/components/dashboard/AddProductModal'

export default function InventoryPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Charger les stocks (Jointure Stocks + Produits)
  const fetchInventory = async () => {
    setLoading(true)
    try {
      // On récupère le stock de la pharmacie ID 1 (Pour le MVP on hardcode l'ID 1)
      // Dans la version finale, on utilisera l'ID de l'utilisateur connecté
      const { data, error } = await supabase
        .from('stocks')
        .select(`
          id,
          price,
          available,
          products ( id, name, image_url )
        `)
        .eq('pharmacy_id', 1) 
      
      if (error) throw error
      setStocks(data)
    } catch (error) {
      console.error('Erreur stock:', error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Mettre à jour le statut (En Stock <-> Rupture)
  const toggleStock = async (stockId, currentStatus) => {
    // Optimistic UI : On change l'état visuel tout de suite pour que ce soit rapide
    setStocks(stocks.map(item => 
      item.id === stockId ? { ...item, available: !currentStatus } : item
    ))

    // Puis on envoie à la base de données
    await supabase
      .from('stocks')
      .update({ available: !currentStatus })
      .eq('id', stockId)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // Filtrer les résultats selon la recherche
  const filteredStocks = stocks.filter(item => 
    item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* --- EN-TÊTE DE LA PAGE --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestion du Stock</h2>
          <p className="text-gray-500">Gérez la disponibilité de vos médicaments en temps réel.</p>
        </div>
        <AddProductModal onProductAdded={fetchInventory} />
      </div>

      {/* --- BARRE D'OUTILS (Recherche + Filtres) --- */}
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

      {/* --- LE TABLEAU --- */}
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
                  Aucun médicament trouvé.
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
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        En Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                        Rupture
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <label className="text-xs text-gray-400 mr-2">
                        {item.available ? 'Désactiver' : 'Activer'}
                      </label>
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