const COMMON = [
  "senha", "password", "123456", "12345678", "qwerty", "abc123", "111111",
  "iloveyou", "admin", "brasil", "futebol", "premia",
];

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tips: string[];
};

export function evaluatePassword(password: string): Strength {
  const tips: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else tips.push("Use pelo menos 8 caracteres");
  if (password.length >= 12) score++;
  else if (password.length >= 8) tips.push("12+ caracteres deixam bem mais segura");

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else tips.push("Misture letras maiúsculas e minúsculas");

  if (/\d/.test(password)) score++;
  else tips.push("Inclua ao menos um número");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else tips.push("Adicione um símbolo (!, @, #, $)");

  const lower = password.toLowerCase();
  if (COMMON.some((c) => lower.includes(c))) {
    score = Math.min(score, 1);
    tips.unshift("Evite palavras comuns ou o nome do app");
  }
  if (/^(.)\1+$/.test(password) || /0123|1234|2345|abcd/.test(lower)) {
    score = Math.min(score, 1);
    tips.unshift("Evite sequências e caracteres repetidos");
  }

  const clamped = Math.max(0, Math.min(4, score)) as Strength["score"];
  const label = ["Muito fraca", "Fraca", "Razoável", "Forte", "Excelente"][clamped];
  return { score: clamped, label, tips: tips.slice(0, 3) };
}

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-yellow-500",
  "bg-primary",
  "bg-primary",
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        Use 8 ou mais caracteres, com letras, números e símbolos.
      </p>
    );
  }

  const { score, label, tips } = evaluatePassword(password);

  return (
    <div className="space-y-1.5 px-1" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? BAR_COLORS[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-semibold">
        Força da senha: <span className={score >= 3 ? "text-primary" : score === 2 ? "text-yellow-500" : "text-destructive"}>{label}</span>
      </p>
      {tips.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {tips.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
