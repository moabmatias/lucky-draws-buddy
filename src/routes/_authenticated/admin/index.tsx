import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Ticket, ShoppingBag, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState({ products: 0, orders: 0, tickets: 0, users: 0 });

  useEffect(() => {
    (async () => {
      const [p, o, t, u] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        products: p.count ?? 0,
        orders: o.count ?? 0,
        tickets: t.count ?? 0,
        users: u.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Prêmios", value: stats.products, icon: Package, to: "/admin/produtos" as const },
    { label: "Bilhetes", value: stats.tickets, icon: Ticket, to: "/admin" as const },
    { label: "Pedidos", value: stats.orders, icon: ShoppingBag, to: "/admin" as const },
    { label: "Usuários", value: stats.users, icon: Users, to: "/admin" as const },
  ];

  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-border bg-surface p-4 hover:border-primary transition"
          >
            <c.icon className="size-5 text-primary mb-2" />
            <p className="font-display text-3xl">{c.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <Link
        to="/admin/produtos"
        className="block rounded-2xl bg-primary text-primary-foreground p-5 text-center font-display tracking-tight"
      >
        GERENCIAR PRÊMIOS
      </Link>
    </div>
  );
}
