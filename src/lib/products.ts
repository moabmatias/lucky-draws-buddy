import moto from "@/assets/product-moto.jpg";
import watch from "@/assets/product-watch.jpg";
import phone from "@/assets/product-phone.jpg";
import headphones from "@/assets/product-headphones.jpg";

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
    id: "onyx-moto-r1",
    name: "ONYX MOTO R1",
    tagline: "Moto elétrica premium",
    image: moto,
    ticketPrice: 14.9,
    remaining: 142,
    drawDay: "SORTEIO SÁBADO",
  },
  {
    id: "titan-chrono",
    name: "TITAN CHRONO",
    tagline: "Relógio titânio edição limitada",
    image: watch,
    ticketPrice: 4.5,
    remaining: 840,
    drawDay: "SORTEIO DOMINGO",
  },
  {
    id: "phantom-phone",
    name: "PHANTOM 15 PRO",
    tagline: "Smartphone última geração",
    image: phone,
    ticketPrice: 9.9,
    remaining: 312,
    drawDay: "SORTEIO SEXTA",
  },
  {
    id: "neon-cans",
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
