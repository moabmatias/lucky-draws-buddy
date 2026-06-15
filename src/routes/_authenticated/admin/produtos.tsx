import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductStatus = Database["public"]["Enums"]["product_status"];

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: AdminProducts,
});

const BUCKET = "product-images";
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10; // 10 anos

async function resolveImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

type FormState = {
  id?: string;
  name: string;
  description: string;
  ticket_price: string;
  total_tickets: string;
  retail_value: string;
  draw_date: string;
  status: ProductStatus;
  image_path: string | null;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  ticket_price: "",
  total_tickets: "100",
  retail_value: "",
  draw_date: "",
  status: "active",
  image_path: null,
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setProducts(data ?? []);
    const map: Record<string, string> = {};
    await Promise.all(
      (data ?? []).map(async (p) => {
        const u = await resolveImageUrl(p.image_url);
        if (u) map[p.id] = u;
      }),
    );
    setUrls(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing({ ...emptyForm, draw_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16) });
  }

  function openEdit(p: Product) {
    setEditing({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      ticket_price: (p.ticket_price_cents / 100).toFixed(2),
      total_tickets: String(p.total_tickets),
      retail_value: p.retail_value_cents ? (p.retail_value_cents / 100).toFixed(2) : "",
      draw_date: new Date(p.draw_date).toISOString().slice(0, 16),
      status: p.status,
      image_path: p.image_url,
    });
  }

  async function handleUpload(file: File) {
    if (!editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast.error("Falha no upload: " + error.message);
      return;
    }
    setEditing({ ...editing, image_path: path });
    toast.success("Imagem enviada.");
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.ticket_price || !editing.draw_date) {
      toast.error("Preencha nome, preço do bilhete e data do sorteio.");
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      description: editing.description.trim() || null,
      ticket_price_cents: Math.round(parseFloat(editing.ticket_price) * 100),
      total_tickets: parseInt(editing.total_tickets, 10) || 100,
      retail_value_cents: editing.retail_value ? Math.round(parseFloat(editing.retail_value) * 100) : null,
      draw_date: new Date(editing.draw_date).toISOString(),
      status: editing.status,
      image_url: editing.image_path,
    };

    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing.id ? "Prêmio atualizado." : "Prêmio criado.");
    setEditing(null);
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Remover "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Prêmio removido.");
    load();
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {products.length} prêmio{products.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-display px-4 py-2 rounded-xl text-sm"
        >
          <Plus className="size-4" /> NOVO
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum prêmio cadastrado ainda.
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-surface p-3 flex gap-3">
              <div className="size-20 rounded-xl bg-background overflow-hidden shrink-0">
                {urls[p.id] ? (
                  <img src={urls[p.id]} alt={p.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full grid place-items-center text-[10px] text-muted-foreground">sem foto</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <span
                    className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      p.status === "active"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1">
                  R$ {(p.ticket_price_cents / 100).toFixed(2)} / bilhete · {p.sold_tickets}/{p.total_tickets} vendidos
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sorteio: {new Date(p.draw_date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="size-8 rounded-lg bg-background border border-border grid place-items-center"
                  aria-label="Editar"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => remove(p)}
                  className="size-8 rounded-lg bg-background border border-border grid place-items-center text-destructive"
                  aria-label="Remover"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-end sm:place-items-center">
          <div className="bg-background w-full max-w-[430px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border">
            <div className="sticky top-0 bg-background flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display text-lg">{editing.id ? "Editar prêmio" : "Novo prêmio"}</h2>
              <button onClick={() => setEditing(null)} className="size-8 grid place-items-center">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <ImageField
                imagePath={editing.image_path}
                uploading={uploading}
                onUpload={handleUpload}
                onClear={() => setEditing({ ...editing, image_path: null })}
              />

              <Field label="Nome">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="input"
                  placeholder="Ex: ONYX MOTO R1"
                />
              </Field>

              <Field label="Descrição">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Moto elétrica premium…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço bilhete (R$)">
                  <input
                    type="number"
                    step="0.01"
                    value={editing.ticket_price}
                    onChange={(e) => setEditing({ ...editing, ticket_price: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Total de bilhetes">
                  <input
                    type="number"
                    value={editing.total_tickets}
                    onChange={(e) => setEditing({ ...editing, total_tickets: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Valor de mercado (R$, opcional)">
                <input
                  type="number"
                  step="0.01"
                  value={editing.retail_value}
                  onChange={(e) => setEditing({ ...editing, retail_value: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Data e hora do sorteio">
                <input
                  type="datetime-local"
                  value={editing.draw_date}
                  onChange={(e) => setEditing({ ...editing, draw_date: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Status">
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as ProductStatus })}
                  className="input"
                >
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativo (à venda)</option>
                  <option value="drawn">Sorteado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </Field>

              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground font-display py-3 rounded-xl disabled:opacity-60"
              >
                {saving ? "SALVANDO…" : editing.id ? "SALVAR ALTERAÇÕES" : "CRIAR PRÊMIO"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          background: hsl(var(--surface, var(--card)));
          border: 1px solid hsl(var(--border));
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: inherit;
        }
        .input:focus { outline: 2px solid hsl(var(--primary)); outline-offset: -1px; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function ImageField({
  imagePath,
  uploading,
  onUpload,
  onClear,
}: {
  imagePath: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!imagePath) {
      setPreview(null);
      return;
    }
    if (imagePath.startsWith("http")) {
      setPreview(imagePath);
      return;
    }
    resolveImageUrl(imagePath).then((u) => {
      if (active) setPreview(u);
    });
    return () => {
      active = false;
    };
  }, [imagePath]);

  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        Imagem
      </span>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img src={preview} alt="" className="w-full aspect-video object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 size-8 rounded-full bg-background/90 grid place-items-center"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border-2 border-dashed border-border bg-surface cursor-pointer text-muted-foreground text-xs">
          <Upload className="size-5" />
          {uploading ? "Enviando…" : "Clique para enviar"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
