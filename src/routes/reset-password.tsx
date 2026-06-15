import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Redefinir senha — Premiá" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada!");
    navigate({ to: "/" });
  }

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto px-6 py-10">
      <Link to="/" className="font-display text-3xl tracking-tighter italic mb-10 block">
        PREMIÁ<span className="text-primary">.</span>
      </Link>
      <h1 className="font-display text-5xl tracking-tighter leading-none mb-8">Nova senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12"
        />
        <Button type="submit" disabled={loading} className="h-12 font-bold">
          {loading ? "..." : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
