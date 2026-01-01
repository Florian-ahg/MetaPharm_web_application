export const mockPharmacies = [
  {
    id: 1,
    name: "Pharmacie de la Gare",
    quartier: "Gare, Cotonou",
    lat: 6.3654,
    lng: 2.4183,
    is_on_duty: true,
    phone: "+229 21 31 00 00"
  },
  {
    id: 2,
    name: "Pharmacie Camp Guezo",
    quartier: "Camp Guezo, Cotonou",
    lat: 6.3550,
    lng: 2.4250,
    is_on_duty: false,
    phone: "+229 21 30 15 15"
  },
  {
    id: 3,
    name: "Pharmacie Saint Michel",
    quartier: "Saint Michel, Cotonou",
    lat: 6.3700,
    lng: 2.4300,
    is_on_duty: true,
    phone: "+229 21 32 22 22"
  },
  {
    id: 4,
    name: "Pharmacie Jonquet",
    quartier: "Jonquet, Cotonou",
    lat: 6.3600,
    lng: 2.4100,
    is_on_duty: false,
    phone: "+229 21 33 33 33"
  },
  {
    id: 5,
    name: "Pharmacie Akpakpa",
    quartier: "Akpakpa, Cotonou",
    lat: 6.3800,
    lng: 2.4500,
    is_on_duty: true,
    phone: "+229 21 34 44 44"
  }
];

export const mockProducts = [
  { id: 101, name: "Doliprane 1000mg" },
  { id: 102, name: "Doliprane 500mg" },
  { id: 103, name: "Coartem 80/480" },
  { id: 104, name: "Paracétamol" },
  { id: 105, name: "Efferalgan" }
];

export const mockStocks = [
  { pharmacy_id: 1, product_id: 101, price: 1500, available: true },
  { pharmacy_id: 1, product_id: 103, price: 2500, available: true },
  { pharmacy_id: 2, product_id: 101, price: 1550, available: true },
  { pharmacy_id: 3, product_id: 102, price: 800, available: true },
  { pharmacy_id: 3, product_id: 103, price: 2400, available: true },
  { pharmacy_id: 3, product_id: 104, price: 500, available: true },
  { pharmacy_id: 5, product_id: 101, price: 1500, available: true },
  { pharmacy_id: 5, product_id: 104, price: 450, available: true },
];
