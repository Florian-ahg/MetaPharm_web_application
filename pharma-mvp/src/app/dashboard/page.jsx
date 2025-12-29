'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer le nombre total de produits
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Récupérer le nombre d'articles en rupture de stock
        const { count: lowStockCount } = await supabase
          .from('stocks')
          .select('*', { count: 'exact', head: true })
          .eq('available', false)

        setStats({
          totalProducts: productsCount || 0,
          lowStockItems: lowStockCount || 0,
          todaySales: 0, // À implémenter plus tard
          revenue: 0, // À implémenter plus tard
        })
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Produits en stock',
      value: stats.totalProducts,
      description: 'Total des références',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Stock faible',
      value: stats.lowStockItems,
      description: 'Articles à réapprovisionner',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Ventes du jour',
      value: stats.todaySales,
      description: 'Transactions aujourd\'hui',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.revenue}€`,
      description: 'Revenus du jour',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-gray-500 mt-1">
          Bienvenue dans votre espace de gestion
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/inventory"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium">Gérer le stock</p>
                  <p className="text-sm text-gray-500">Ajouter ou modifier des produits</p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/sales"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium">Nouvelle vente</p>
                  <p className="text-sm text-gray-500">Enregistrer une transaction</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières opérations effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune activité récente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
