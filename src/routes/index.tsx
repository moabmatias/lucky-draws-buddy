import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { ProductSlide } from "@/components/ProductSlide";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LuckyDrop — Sorteios semanais de produtos premium" },
      {
        name: "description",
        content:
          "Concorra a motos, smartphones, relógios e mais toda semana. Adicione no carrinho, receba suas dezenas da sorte e pague via PIX ou cartão.",
      },
      { property: "og:title", content: "LuckyDrop — Sorteios semanais" },
      {
        property: "og:description",
        content: "Sorteios semanais de produtos premium. Suas dezenas da sorte em segundos.",
      },
    ],
  }),
  component: Feed,
});

function Feed() {
  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto relative overflow-hidden ring-1 ring-black/5">
      <TopNav />
      <main className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {products.map((p) => (
          <ProductSlide key={p.id} product={p} />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
