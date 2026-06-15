import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/products";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { Trash2, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Carrinho — Premiá" },
      { name: "description", content: "Revise seus bilhetes e dezenas da sorte antes de pagar." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto relative ring-1 ring-black/5">
      <TopNav />
      <main className="pt-24 pb-40 px-5">
        <div className="flex justify-between items-baseline mb-6">
          <h1 className="font-display text-4xl uppercase tracking-tight">Carrinho</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "ITEM" : "ITENS"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Nenhum bilhete ainda.</p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground font-display text-lg px-6 py-3 rounded-xl"
            >
              VER DROPS
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.addedAt}`}
                className="flex gap-3 p-3 rounded-2xl bg-surface border border-border"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="size-16 rounded-xl object-cover shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 items-start">
                    <div className="font-bold text-sm truncate">{item.product.name}</div>
                    <button
                      onClick={() => remove(item.product.id, item.addedAt)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex gap-1 mt-1.5 mb-1">
                    {item.numbers.map((n, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                      >
                        {n.toString().padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <div className="font-bold text-sm">{formatBRL(item.product.ticketPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-[430px] mx-auto px-5 pb-3 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <button
            onClick={() => navigate({ to: "/checkout" })}
            className="w-full bg-primary text-primary-foreground font-display text-xl py-5 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
          >
            PAGAR {formatBRL(total)} <ArrowRight className="size-5" />
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
