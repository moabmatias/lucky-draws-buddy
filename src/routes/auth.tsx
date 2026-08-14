import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Premiá" },
      { name: "description", content: "Acesse sua conta Premiá para participar dos sorteios semanais." },
      { property: "og:title", content: "Entrar — Premiá" },
      { property: "og:description", content: "Acesse sua conta Premiá para participar dos sorteios semanais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (mode === "signup" && password.length < 8) {
      setFeedback({ type: "error", message: "Crie uma senha com pelo menos 8 caracteres, misturando letras, números e símbolos." });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Boa sorte!");
        navigate({ to: "/" });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate({ to: "/" });
        } else {
          setFeedback({ type: "success", message: "Conta criada. Abra o e-mail de confirmação enviado para concluir o cadastro." });
        }
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
      const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";
      const message =
        code === "weak_password"
          ? "Essa senha é conhecida como fraca ou vazada. Escolha uma senha nova, com letras, números e símbolos."
          : code === "user_already_exists"
            ? "Já existe uma conta com este e-mail. Entre ou recupere sua senha."
            : code === "invalid_credentials"
              ? "E-mail ou senha inválidos. Confira os dados ou recupere sua senha."
              : err instanceof Error
                ? err.message
                : "Não foi possível concluir. Tente novamente.";
      setFeedback({ type: "error", message });
      toast.error(message);
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

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
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
          <div className="space-y-1.5">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signup" ? 8 : 6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-12"
            />
            {mode === "signup" && (
              <p className="px-1 text-xs text-muted-foreground">Use 8 ou mais caracteres e evite senhas comuns ou já utilizadas.</p>
            )}
          </div>
        )}
        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={feedback.type === "error" ? "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" : "rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-foreground"}
          >
            {feedback.message}
          </p>
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
            <Button
              type="button"
              onClick={() => setMode("forgot")}
              variant="link"
              className="h-auto w-full text-muted-foreground"
            >
              Esqueci minha senha
            </Button>
            <Button
              type="button"
              onClick={() => setMode("signup")}
              variant="link"
              className="h-auto font-semibold"
            >
              Não tem conta? Cadastre-se
            </Button>
          </>
        )}
        {mode === "signup" && (
          <Button
            type="button"
            onClick={() => setMode("signin")}
            variant="link"
            className="h-auto font-semibold"
          >
            Já tem conta? Entrar
          </Button>
        )}
        {mode === "forgot" && (
          <Button
            type="button"
            onClick={() => setMode("signin")}
            variant="link"
            className="h-auto font-semibold"
          >
            Voltar para o login
          </Button>
        )}
      </div>
    </div>
  );
}
