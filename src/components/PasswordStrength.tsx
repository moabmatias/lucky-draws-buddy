const COMMON = [
  "senha", "password", "123456", "12345678", "qwerty", "abc123", "111111",
  "iloveyou", "admin", "brasil", "futebol", "premia",
];

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tips: string[];
};

export type PasswordChecks = {
  minLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
  hasSymbol: boolean;
  noCommon: boolean;
  noSequence: boolean;
};

export function checkPassword(password: string): PasswordChecks {
  const lower = password.toLowerCase();
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    noCommon: password.length > 0 && !COMMON.some((c) => lower.includes(c)),
    noSequence: password.length > 0 && !(/^(.)(\1)*$/.test(password) || /0123|1234|2345|abcd/.test(lower)),
  };
}

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
  if (/^(.)(\1)*$/.test(password) || /0123|1234|2345|abcd/.test(lower)) {
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

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors ${
        checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
      aria-hidden="true"
    >
      {checked ? "✓" : "×"}
    </span>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const checks = checkPassword(password);

  const items = [
    { key: "minLength", label: "Mínimo 8 caracteres", ok: checks.minLength },
    { key: "hasNumber", label: "Pelo menos 1 número", ok: checks.hasNumber },
    { key: "hasLetter", label: "Pelo menos 1 letra", ok: checks.hasLetter },
    { key: "hasSymbol", label: "Pelo menos 1 símbolo (!@#$...)", ok: checks.hasSymbol },
    { key: "noCommon", label: "Evite palavras comuns", ok: checks.noCommon },
    { key: "noSequence", label: "Evite sequências (1234, abcd)", ok: checks.noSequence },
  ];

  return (
    <ul className="space-y-1 px-1" aria-live="polite">
      {items.map((item) => (
        <li
          key={item.key}
          className={`flex items-center gap-2 text-xs transition-colors ${
            item.ok ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <Check checked={item.ok} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return (
      <div className="space-y-2 px-1">
        <p className="text-xs text-muted-foreground">
          Use 8 ou mais caracteres, com letras, números e símbolos.
        </p>
        <PasswordRequirements password={password} />
      </div>
    );
  }

  const { score, label, tips } = evaluatePassword(password);

  return (
    <div className="space-y-2 px-1" aria-live="polite">
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
      <PasswordRequirements password={password} />
    </div>
  );
}
