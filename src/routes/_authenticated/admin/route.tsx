import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useIsAdmin } from "@/lib/use-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Shield, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, anyAdminExists } = useIsAdmin();
  const navigate = useNavigate();

  if (isAdmin === null || anyAdminExists === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">
        Carregando painel…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto px-5 pt-12">
        <Link to="/perfil" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <Shield className="size-10 text-primary mb-4" />
        <h1 className="font-display text-3xl tracking-tight mb-2">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Esta área é para administradores do Premiá.
        </p>

        {!anyAdminExists && (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm mb-4">
              Nenhum administrador foi cadastrado ainda. Como esta é a primeira conta,
              você pode se tornar o administrador inicial.
            </p>
            <button
              onClick={async () => {
                const { data: u } = await supabase.auth.getUser();
                if (!u.user) return;
                const { error } = await supabase
                  .from("user_roles")
                  .insert({ user_id: u.user.id, role: "admin" });
                if (error) {
                  toast.error("Não foi possível promover: " + error.message);
                  return;
                }
                toast.success("Você agora é administrador!");
                navigate({ to: "/admin", reloadDocument: true });
              }}
              className="bg-primary text-primary-foreground font-display px-5 py-2.5 rounded-xl text-sm"
            >
              TORNAR-ME ADMIN
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto pb-12 ring-1 ring-black/5">
      <header className="px-5 pt-8 pb-6 flex items-center gap-3">
        <Link to="/perfil" className="size-10 rounded-full bg-surface grid place-items-center border border-border">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Painel</p>
          <h1 className="font-display text-2xl tracking-tight">Administração</h1>
        </div>
      </header>

      <nav className="px-5 flex gap-2 mb-6 overflow-x-auto">
        <Link
          to="/admin"
          activeOptions={{ exact: true }}
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-surface border border-border data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:border-primary whitespace-nowrap"
        >
          Início
        </Link>
        <Link
          to="/admin/produtos"
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-surface border border-border data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:border-primary whitespace-nowrap inline-flex items-center gap-1.5"
        >
          <Package className="size-3.5" /> Prêmios
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
