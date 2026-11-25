export interface Banner {
  id: string;
  image: string;
  alt: string;
}

export const banners: Banner[] = [
  {
    id: "pure-veg-meals",
    image: "/images/banners/pure-veg-meals.webp",
    alt: "Pure Veg Andhra Meals — 50% off today's special",
  },
  {
    id: "dosas-tiffins",
    image: "/images/banners/dosas-tiffins.webp",
    alt: "Crispy Dosas & Tiffins — buy 1 get 1 on all tiffins",
  },
  {
    id: "weekend-thali",
    image: "/images/banners/weekend-thali.webp",
    alt: "Weekend Thali Combo — flat ₹99 this weekend only",
  },
  {
    id: "free-delivery",
    image: "/images/banners/free-delivery.webp",
    alt: "Free delivery today — no delivery fee, limited time",
  },
];
