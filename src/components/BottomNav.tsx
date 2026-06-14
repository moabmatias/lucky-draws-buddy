import { Link } from "@tanstack/react-router";
import { Sparkles, Trophy, User } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-background/95 backdrop-blur-md border-t border-border px-8 py-3 flex justify-between items-center z-40">
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className="flex flex-col items-center gap-1 text-muted-foreground data-[status=active]:text-primary"
      >
        <Sparkles className="size-5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Drops</span>
      </Link>
      <Link
        to="/cart"
        className="flex flex-col items-center gap-1 text-muted-foreground data-[status=active]:text-primary"
      >
        <Trophy className="size-5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Carrinho</span>
      </Link>
      <button className="flex flex-col items-center gap-1 text-muted-foreground">
        <User className="size-5" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Perfil</span>
      </button>
    </nav>
  );
}
