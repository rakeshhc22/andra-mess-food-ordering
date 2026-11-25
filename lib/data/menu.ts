/**
 * Static menu data for the customer-facing demo.
 *
 * The shape intentionally mirrors the planned `menu_items` Supabase table so
 * this file can be swapped for a real fetch later without touching any
 * component that consumes `MenuItem`.
 */

export type MenuCategory =
  | "meals"
  | "tiffins"
  | "curries"
  | "rice"
  | "breads";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  isVeg: boolean;
  rating: number;
  reviewCount: string;
  /** Path under /public, e.g. "/images/food/idli-sambar.webp" */
  image: string;
}

export const categories: { id: MenuCategory; label: string }[] = [
  { id: "meals", label: "Meals" },
  { id: "tiffins", label: "Tiffins" },
  { id: "curries", label: "Curries" },
  { id: "rice", label: "Rice" },
  { id: "breads", label: "Breads" },
];

export const menuItems: MenuItem[] = [
  {
    id: "idli-sambar",
    name: "Idli Sambar",
    description:
      "Steamed rice cakes, soft and pillowy, served with hot sambar and coconut chutney.",
    price: 79,
    category: "tiffins",
    isVeg: true,
    rating: 4.7,
    reviewCount: "1.2K",
    image: "/images/food/idli-sambar.webp",
  },
  {
    id: "masala-dosa",
    name: "Masala Dosa",
    description:
      "Crisp fermented crepe filled with spiced potato masala, served with chutney and sambar.",
    price: 99,
    category: "tiffins",
    isVeg: true,
    rating: 4.8,
    reviewCount: "2.1K",
    image: "/images/food/masala-dosa.webp",
  },
  {
    id: "andhra-meals",
    name: "Andhra Meals (Full)",
    description:
      "Rice, sambar, rasam, two curries, pickle, papad, curd and dessert on a banana leaf.",
    price: 149,
    category: "meals",
    isVeg: true,
    rating: 4.9,
    reviewCount: "842",
    image: "/images/food/andhra-meals.webp",
  },
  {
    id: "lemon-rice",
    name: "Lemon Rice",
    description:
      "Tangy rice tempered with mustard seeds, peanuts, curry leaves and turmeric.",
    price: 99,
    category: "rice",
    isVeg: true,
    rating: 4.6,
    reviewCount: "654",
    image: "/images/food/lemon-rice.webp",
  },
  {
    id: "anna-sambar",
    name: "Anna Sambar",
    description:
      "Comfort-style rice mixed with lentil sambar, ghee and a side of crunchy appalam.",
    price: 89,
    category: "meals",
    isVeg: true,
    rating: 4.6,
    reviewCount: "531",
    image: "/images/food/anna-sambar.webp",
  },
  {
    id: "chapathi",
    name: "Chapathi (2 pcs)",
    description:
      "Soft whole-wheat flatbreads, two pieces, served with a side curry of the day.",
    price: 69,
    category: "breads",
    isVeg: true,
    rating: 4.5,
    reviewCount: "398",
    image: "/images/food/chapathi.webp",
  },
  {
    id: "pulihora",
    name: "Pulihora (Tamarind Rice)",
    description:
      "Tangy tamarind rice tempered with peanuts, sesame and curry leaves, a festival favourite.",
    price: 89,
    category: "rice",
    isVeg: true,
    rating: 4.7,
    reviewCount: "912",
    image: "/images/food/pulihora.webp",
  },
  {
    id: "bisi-bele-bath",
    name: "Bisi Bele Bath",
    description:
      "One-pot rice and lentils simmered with vegetables and a fragrant spice blend, topped with ghee.",
    price: 109,
    category: "rice",
    isVeg: true,
    rating: 4.7,
    reviewCount: "1.5K",
    image: "/images/food/bisi-bele-bath.webp",
  },
];
