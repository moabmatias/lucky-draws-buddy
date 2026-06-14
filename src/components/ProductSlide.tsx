import { useState } from "react";
import { type Product, formatBRL } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { Plus, Check } from "lucide-react";

export function ProductSlide({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    const item = add(product);
    setNumbers(item.numbers);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <section className="snap-start h-screen w-full flex flex-col pt-20 pb-24">
      <div className="flex-1 px-4 py-3 flex flex-col gap-3 min-h-0">
        {/* Banner */}
        <div className="relative flex-1 min-h-0 rounded-3xl overflow-hidden bg-muted ring-1 ring-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            width={768}
            height={1344}
          />
          <div className="absolute top-6 right-6 bg-primary text-primary-foreground font-display text-base px-4 py-1 skew-x-[-12deg] shadow-lg shadow-primary/30">
            {product.drawDay}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
            <h2 className="font-display text-4xl uppercase leading-[0.9] mb-3 tracking-tight">
              {product.name}
            </h2>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider">
                  Bilhete
                </p>
                <p className="text-2xl font-bold">{formatBRL(product.ticketPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider">
                  Restam
                </p>
                <p className="text-2xl font-bold">{product.remaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA + numbers */}
        <div className="space-y-3">
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground font-display text-xl py-5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
          >
            {justAdded ? (
              <>
                <Check className="size-5" /> ADICIONADO
              </>
            ) : (
              <>
                <Plus className="size-5" /> ADICIONAR NO CARRINHO
              </>
            )}
          </button>

          {numbers && (
            <div key={numbers.join("-")} className="flex justify-between gap-2">
              {numbers.map((n, i) => (
                <div
                  key={i}
                  className="animate-pop flex-1 aspect-square bg-background border-2 border-primary rounded-xl flex items-center justify-center font-mono text-lg font-bold shadow-sm"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {n.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
