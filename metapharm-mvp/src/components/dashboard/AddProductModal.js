'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AddProductModal({ onProductAdded }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    try {
      // --- ETAPE 0 : Récupérer l'ID de la pharmacie du pharmacien connecté ---
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      const { data: profile } = await supabase
        .from('profiles')
        .select('pharmacy_id')
        .eq('id', user.id)
        .single()

      if (!profile?.pharmacy_id) throw new Error("Aucune pharmacie liée à ce compte")
      const myPharmacyId = profile.pharmacy_id
      // ---------------------------------------------------------------------

      // 1. Vérifier / Créer Produit
      let productId = null
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .ilike('name', formData.name.trim())
        .maybeSingle()

      if (existingProduct) {
        productId = existingProduct.id
      } else {
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert([{ name: formData.name.trim() }])
          .select()
          .single()
        
        if (createError) throw createError
        productId = newProduct.id
      }

      // 2. Insérer dans le stock avec le VRAI ID Pharmacie
      const { error: stockError } = await supabase
        .from('stocks')
        .insert([{
          pharmacy_id: myPharmacyId, // <--- On utilise l'ID dynamique ici !
          product_id: productId,
          price: parseInt(formData.price),
          available: true
        }])

      if (stockError) throw stockError

      toast.success("Produit ajouté au stock !")
      setOpen(false)
      setFormData({ name: '', price: '' })
      if (onProductAdded) onProductAdded()

    } catch (error) {
      console.error(error)
      toast.error(`Erreur : ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-700 hover:bg-green-800">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouveau Médicament</DialogTitle>
            <DialogDescription>
              Ajoutez un médicament à votre stock. S&apos;il n&apos;existe pas dans la base, il sera créé.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                placeholder="Ex: Efferalgan 500mg"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix (FCFA)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Ex: 1500"
                className="col-span-3"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
