import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/products";
import { ArrowLeft, QrCode, CreditCard, Wallet, Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Pagamento — Premiá" },
      { name: "description", content: "Finalize sua compra via PIX, crédito ou débito." },
    ],
  }),
  component: Checkout,
});

type Method = "pix" | "credit" | "debit";

const METHODS: { id: Method; label: string; icon: typeof QrCode; note: string }[] = [
  { id: "pix", label: "PIX", icon: QrCode, note: "Liberação instantânea" },
  { id: "credit", label: "CRÉDITO", icon: CreditCard, note: "Em até 12x" },
  { id: "debit", label: "DÉBITO", icon: Wallet, note: "À vista" },
];

function Checkout() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("pix");
  const [done, setDone] = useState(false);

  const pay = () => {
    setDone(true);
    setTimeout(() => {
      clear();
      navigate({ to: "/" });
    }, 2200);
  };

  if (done) {
    return (
      <div className="bg-background min-h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center px-6 text-center ring-1 ring-black/5 animate-fade">
        <div className="size-20 rounded-full bg-primary grid place-items-center mb-6 animate-pop">
          <Check className="size-10 text-primary-foreground" strokeWidth={3} />
        </div>
        <h2 className="font-display text-4xl uppercase mb-2">PAGAMENTO OK</h2>
        <p className="text-muted-foreground max-w-xs">
          Seus bilhetes foram confirmados. Boa sorte no sorteio!
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center px-6 ring-1 ring-black/5">
        <p className="text-muted-foreground mb-6">Carrinho vazio.</p>
        <Link to="/" className="bg-primary text-primary-foreground font-display text-lg px-6 py-3 rounded-xl">
          VER DROPS
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto relative ring-1 ring-black/5">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-5 py-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate({ to: "/cart" })} className="size-9 rounded-full bg-surface grid place-items-center">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="font-display text-2xl uppercase tracking-tight">Pagamento</h1>
      </header>

      <main className="px-5 py-6 pb-40 space-y-8">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Resumo
          </p>
          <div className="rounded-2xl bg-surface border border-border p-4 space-y-2.5">
            {items.map((i) => (
              <div
                key={`${i.product.id}-${i.addedAt}`}
                className="flex justify-between text-sm gap-3"
              >
                <span className="truncate font-medium">{i.product.name}</span>
                <span className="font-mono shrink-0">{formatBRL(i.product.ticketPrice)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2.5 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="font-mono">{formatBRL(total)}</span>
            </div>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Método de pagamento
          </p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface opacity-60"
                  }`}
                >
                  <Icon className={`size-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-bold tracking-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            {METHODS.find((m) => m.id === method)?.note}
          </p>
        </section>

        {method === "pix" && (
          <section className="rounded-2xl bg-surface border border-border p-6 text-center">
            <div className="mx-auto size-40 bg-foreground rounded-xl mb-4 grid place-items-center">
              <QrCode className="size-24 text-background" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Escaneie o QR Code para pagar
            </p>
          </section>
        )}

        {method !== "pix" && (
          <section className="space-y-3">
            <input
              placeholder="Número do cartão"
              className="w-full px-4 py-3.5 rounded-xl bg-surface border border-border font-mono text-sm focus:outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="MM/AA"
                className="px-4 py-3.5 rounded-xl bg-surface border border-border font-mono text-sm focus:outline-none focus:border-primary"
              />
              <input
                placeholder="CVV"
                className="px-4 py-3.5 rounded-xl bg-surface border border-border font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <input
              placeholder="Nome no cartão"
              className="w-full px-4 py-3.5 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:border-primary"
            />
          </section>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={pay}
          className="w-full bg-primary text-primary-foreground font-display text-xl py-5 rounded-2xl shadow-xl shadow-primary/30"
        >
          CONFIRMAR {formatBRL(total)}
        </button>
      </div>
    </div>
  );
}
