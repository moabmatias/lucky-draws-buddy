import moto from "@/assets/product-moto.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/product-phone.jpg";
import headphones from "@/assets/product-headphones.jpg";
import pixMoneyAsset from "@/assets/pix-money.webp.asset.json";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  ticketPrice: number;
  remaining: number;
  drawDay: string;
};

export const products: Product[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "PIX DE R$ 20,00",
    tagline: "Prêmio instantâneo em dinheiro",
    image: "https://images.unsplash.com/photo-1621933486609-2d876c1f99d9?q=80&w=1000&auto=format&fit=crop",
    ticketPrice: 2.0,
    remaining: 142,
    drawDay: "SORTEIO SÁBADO",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "TITAN CHRONO",
    tagline: "Relógio titânio edição limitada",
    image: watch,
    ticketPrice: 4.5,
    remaining: 840,
    drawDay: "SORTEIO DOMINGO",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "PHANTOM 15 PRO",
    tagline: "Smartphone última geração",
    image: phone,
    ticketPrice: 9.9,
    remaining: 312,
    drawDay: "SORTEIO SEXTA",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "NEON CANS XL",
    tagline: "Fone wireless noise cancelling",
    image: headphones,
    ticketPrice: 3.5,
    remaining: 1240,
    drawDay: "SORTEIO QUINTA",
  },
];

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function generateLuckyNumbers(): number[] {
  const set = new Set<number>();
  while (set.size < 5) set.add(Math.floor(Math.random() * 100));
  return Array.from(set);
}
