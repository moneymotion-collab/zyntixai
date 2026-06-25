import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klanten | FitAI",
  description: "Beheer klanten in het FitAI-dashboard",
};

type ClientStatus = "actief" | "inactief" | "proefperiode";

type Client = {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  lastActivity: string;
};

/** Vervang door echte data zodra de API gekoppeld is. */
const CLIENTS: Client[] = [];

const STATUS_LABELS: Record<ClientStatus, string> = {
  actief: "Actief",
  inactief: "Inactief",
  proefperiode: "Proefperiode",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const styles: Record<ClientStatus, string> = {
    actief:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30",
    inactief:
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-500/30",
    proefperiode:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Klantenlijst</caption>
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th
              scope="col"
              className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 sm:px-6"
            >
              Naam
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 sm:px-6"
            >
              E-mail
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 sm:px-6"
            >
              Status
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 md:table-cell sm:px-6"
            >
              Laatste activiteit
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400 sm:px-6"
            >
              <span className="sr-only">Acties</span>
              Acties
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
            >
              <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    aria-hidden="true"
                  >
                    {getInitials(client.name)}
                  </span>
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">
                    {client.name}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-zinc-600 dark:text-zinc-400 sm:px-6">
                {client.email}
              </td>
              <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                <StatusBadge status={client.status} />
              </td>
              <td className="hidden whitespace-nowrap px-4 py-4 text-zinc-600 dark:text-zinc-400 md:table-cell sm:px-6">
                <time dateTime={client.lastActivity}>{client.lastActivity}</time>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right sm:px-6">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Bekijken
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label={`Meer acties voor ${client.name}`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900"
        aria-hidden="true"
      >
        <svg
          className="h-7 w-7 text-zinc-500 dark:text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.21a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      </div>
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Nog geen klanten
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Voeg je eerste klant toe om voortgang, contactgegevens en activiteit op één plek
          te beheren.
        </p>
      </div>
      <button
        type="button"
        disabled
        className="mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        aria-disabled="true"
        title="Binnenkort beschikbaar"
      >
        Eerste klant toevoegen
      </button>
    </div>
  );
}

function TablePagination({ total }: { total: number }) {
  return (
    <nav
      className="flex flex-col gap-4 border-t border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800"
      aria-label="Paginering klanten"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-950 dark:text-zinc-50">{total}</span>{" "}
        {total === 1 ? "resultaat" : "resultaten"}
        {total > 0 ? (
          <>
            {" "}
            · pagina{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">1</span> van{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">1</span>
          </>
        ) : null}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-400 disabled:cursor-not-allowed dark:border-zinc-700"
          aria-disabled="true"
        >
          Vorige
        </button>
        <button
          type="button"
          aria-current="page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          1
        </button>
        <button
          type="button"
          disabled
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-400 disabled:cursor-not-allowed dark:border-zinc-700"
          aria-disabled="true"
        >
          Volgende
        </button>
      </div>
    </nav>
  );
}

export default function ClientsPage() {
  const total = CLIENTS.length;
  const hasClients = total > 0;

  const stats = [
    { label: "Totaal klanten", value: String(total), hint: "Alle geregistreerde klanten" },
    {
      label: "Actief deze maand",
      value: hasClients
        ? String(CLIENTS.filter((c) => c.status === "actief").length)
        : "0",
      hint: "Met activiteit in de afgelopen 30 dagen",
    },
    {
      label: "Nieuw deze week",
      value: "0",
      hint: "Toegevoegd in de laatste 7 dagen",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Klanten
          </h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Beheer je klanten, volg voortgang en houd contactgegevens bij op één overzichtelijke
            plek.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
          aria-disabled="true"
          title="Binnenkort beschikbaar"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nieuwe klant
        </button>
      </header>

      <section aria-label="Statistieken" className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
      </section>

      <section
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="clients-overview-heading"
      >
        <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
          <h2
            id="clients-overview-heading"
            className="text-base font-semibold text-zinc-950 dark:text-zinc-50"
          >
            Klantenoverzicht
          </h2>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            Zoek, filter en beheer al je klanten.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 dark:border-zinc-800">
          <div className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor="client-search">
              Zoek klanten
            </label>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              id="client-search"
              type="search"
              name="q"
              placeholder="Zoek op naam of e-mail…"
              disabled
              className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-950 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              aria-disabled="true"
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="client-status-filter">
              Filter op status
            </label>
            <select
              id="client-status-filter"
              name="status"
              disabled
              defaultValue=""
              className="h-10 min-w-[10rem] rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-950 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              aria-disabled="true"
            >
              <option value="">Alle statussen</option>
              <option value="actief">Actief</option>
              <option value="inactief">Inactief</option>
              <option value="proefperiode">Proefperiode</option>
            </select>
            <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400" aria-live="polite">
              <span className="font-medium text-zinc-950 dark:text-zinc-50">{total}</span>{" "}
              {total === 1 ? "klant" : "klanten"}
            </p>
          </div>
        </div>

        {hasClients ? <ClientsTable clients={CLIENTS} /> : <EmptyState />}

        <TablePagination total={total} />
      </section>
    </div>
  );
}
