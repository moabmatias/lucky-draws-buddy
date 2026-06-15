import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { formatBRL } from "@/lib/products";
import { LogOut, Trophy, Ticket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Premiá" },
      { name: "description", content: "Seus bilhetes, histórico de sorteios e conta Premiá." },
    ],
  }),
  component: PerfilPage,
});

type TicketRow = {
  id: string;
  numbers: number[];
  is_winner: boolean;
  created_at: string;
  products: { name: string; draw_date: string; status: string } | null;
};

type ProfileRow = { full_name: string | null; avatar_url: string | null };

function PerfilPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? "");

      const [{ data: p }, { data: t }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", userData.user.id)
          .maybeSingle(),
        supabase
          .from("tickets")
          .select("id, numbers, is_winner, created_at, products(name, draw_date, status)")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setTickets((t ?? []) as unknown as TicketRow[]);
      setLoading(false);
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Até a próxima!");
    navigate({ to: "/auth" });
  }

  const initials = (profile?.full_name ?? email).slice(0, 2).toUpperCase();
  const wins = tickets.filter((t) => t.is_winner).length;

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto pb-28 ring-1 ring-black/5">
      <header className="px-5 pt-8 pb-6 flex items-center gap-4">
        <div className="size-16 rounded-full bg-primary grid place-items-center text-primary-foreground font-display text-2xl">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl tracking-tight truncate">
            {profile?.full_name ?? "Bem-vindo"}
          </h1>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="size-10 rounded-full bg-surface grid place-items-center border border-border"
          aria-label="Sair"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      <div className="px-5 grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-2xl bg-surface border border-border p-4">
          <Ticket className="size-5 text-primary mb-2" />
          <p className="font-display text-3xl">{tickets.length}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bilhetes</p>
        </div>
        <div className="rounded-2xl bg-surface border border-border p-4">
          <Trophy className="size-5 text-primary mb-2" />
          <p className="font-display text-3xl">{wins}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Prêmios</p>
        </div>
      </div>

      <section className="px-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Meus bilhetes
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não tem bilhetes. Que tal sentir a sorte?
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground font-display px-5 py-2.5 rounded-xl"
            >
              VER DROPS
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li
                key={t.id}
                className={`rounded-2xl border p-4 ${
                  t.is_winner
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm">{t.products?.name ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      {new Date(t.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {t.is_winner && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Ganhou
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {t.numbers.map((n, i) => (
                    <span
                      key={i}
                      className="size-9 rounded-lg bg-background border border-border grid place-items-center font-mono font-bold text-sm"
                    >
                      {String(n).padStart(2, "0")}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

// Reference formatBRL so tree-shaking keeps a stable shape if used later.
void formatBRL;
