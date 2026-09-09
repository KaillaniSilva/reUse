import Link from "next/link";

type ItemCardProps = {
  id: string;
  title: string;
  description: string;
  condition: string;
  tipo: "DOACAO" | "TROCA";
  status: "DISPONIVEL" | "RESERVADO" | "DOADO";
  categoryName: string;
  categoryIcon: string;
  ownerCity?: string | null;
};

const tipoLabel: Record<ItemCardProps["tipo"], string> = {
  DOACAO: "Doação",
  TROCA: "Troca",
};

const statusStyle: Record<ItemCardProps["status"], string> = {
  DISPONIVEL: "bg-brand-surface text-brand",
  RESERVADO: "bg-amber-50 text-amber-700",
  DOADO: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<ItemCardProps["status"], string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  DOADO: "Concluído",
};

export function ItemCard({
  id,
  title,
  description,
  condition,
  tipo,
  status,
  categoryName,
  categoryIcon,
  ownerCity,
}: ItemCardProps) {
  return (
    <Link
      href={`/catalogo/${id}`}
      className="flex flex-col rounded-2xl border border-brand-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-surface text-xl">
          {categoryIcon}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>
          {statusLabel[status]}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-1 font-bold text-slate-900">{title}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{categoryName}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{tipoLabel[tipo]}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">{condition}</span>
        {ownerCity ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1">📍 {ownerCity}</span>
        ) : null}
      </div>
    </Link>
  );
}
