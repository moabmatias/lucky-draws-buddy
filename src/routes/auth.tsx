import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Premiá" },
      { name: "description", content: "Acesse sua conta Premiá para participar dos sorteios semanais." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Boa sorte!");
        navigate({ to: "/" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email se necessário.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email de recuperação enviado.");
        setMode("signin");
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Falha ao entrar com Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="bg-background text-foreground min-h-screen max-w-[430px] mx-auto px-6 py-10 flex flex-col">
      <Link to="/" className="font-display text-3xl tracking-tighter italic mb-10">
        PREMIÁ<span className="text-primary">.</span>
      </Link>

      <h1 className="font-display text-5xl tracking-tighter leading-none mb-2">
        {mode === "signin" && "Entre na sorte"}
        {mode === "signup" && "Crie sua conta"}
        {mode === "forgot" && "Recuperar senha"}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        {mode === "forgot"
          ? "Enviaremos um link para você redefinir sua senha."
          : "Suas dezenas, seus prêmios."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <Input
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12"
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
        {mode !== "forgot" && (
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12"
          />
        )}
        <Button type="submit" disabled={loading} className="h-12 text-base font-bold">
          {loading
            ? "..."
            : mode === "signin"
              ? "Entrar"
              : mode === "signup"
                ? "Criar conta"
                : "Enviar link"}
        </Button>
      </form>

      {mode !== "forgot" && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogle}
            className="h-12 text-base"
          >
            Continuar com Google
          </Button>
        </>
      )}

      <div className="mt-8 text-center text-sm space-y-2">
        {mode === "signin" && (
          <>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-muted-foreground hover:text-foreground block w-full"
            >
              Esqueci minha senha
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-primary font-semibold"
            >
              Não tem conta? Cadastre-se
            </button>
          </>
        )}
        {mode === "signup" && (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="text-primary font-semibold"
          >
            Já tem conta? Entrar
          </button>
        )}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="text-primary font-semibold"
          >
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}
