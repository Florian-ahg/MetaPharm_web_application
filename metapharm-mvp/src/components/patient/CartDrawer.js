'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CartDrawer() {
  const { cart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, total } = useCart()
  const [loading, setLoading] = useState(false)
  
  // Formulaire Client
  const [formData, setFormData] = useState({ phone: '', address: '' })

  const handleCheckout = async () => {
    if (!formData.phone || !formData.address) {
      toast.error("Veuillez remplir votre téléphone et adresse.")
      return
    }

    // Vérifier que tous les produits ont un ID valide (nombre)
    const invalidItems = cart.filter(item => typeof item.product.id !== 'number')
    if (invalidItems.length > 0) {
      toast.error("Certains articles sont invalides. Veuillez vider le panier et recommencer.")
      return
    }

    setLoading(true)

    try {
      // 1. Grouper les articles par Pharmacie 
      // (Car si on achète chez Pharma A et Pharma B, ça fait 2 commandes différentes)
      const ordersByPharmacy = {}
      
      cart.forEach(item => {
        if (!ordersByPharmacy[item.pharmacy.id]) {
          ordersByPharmacy[item.pharmacy.id] = []
        }
        ordersByPharmacy[item.pharmacy.id].push(item)
      })

      // 2. Créer les commandes dans Supabase
      for (const [pharmacyId, items] of Object.entries(ordersByPharmacy)) {
        
        // Calcul du sous-total pour cette pharmacie
        const subTotal = items.reduce((acc, item) => acc + item.price, 0)

        // A. Créer la Vente (Sale)
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert([{
            pharmacy_id: pharmacyId,
            total_amount: subTotal,
            customer_phone: formData.phone,
            delivery_address: formData.address,
            status: 'pending'
          }])
          .select()
          .single()

        if (saleError) throw saleError

        // B. Créer les Lignes (Sale Items)
        const saleItems = items.map(item => ({
          sale_id: saleData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.price
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) throw itemsError
      }

      // Succès !
      toast.success("Commande envoyée avec succès ! 🚀")
      clearCart()
      setIsCartOpen(false)

    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la commande.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Mon Panier ({cart.length})</SheetTitle>
          <SheetDescription>
            Validez votre commande pour être livré rapidement.
          </SheetDescription>
        </SheetHeader>

        {/* LISTE DES ARTICLES */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Votre panier est vide.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b pb-3">
                <div>
                  <p className="font-bold">{item.product.name}</p>
                  <p className="text-xs text-gray-500">@{item.pharmacy.name}</p>
                  <p className="text-green-700 font-medium">{item.price} FCFA</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* FORMULAIRE & TOTAL (Sticky en bas) */}
        {cart.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{total} FCFA</span>
            </div>

            <div className="space-y-2">
              <Input 
                placeholder="Votre Téléphone (ex: 97 00 00 00)" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <Textarea 
                placeholder="Adresse de livraison précise (ex: Quartier Jack, maison portail bleu...)" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <SheetFooter>
              <Button onClick={handleCheckout} className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Commander et se faire livrer"}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
