"use client";

export default function GlobalError({
  reset,
}: {
  readonly reset: () => void;
}) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-slate-100">
        <main className="flex min-h-screen items-center justify-center px-6 py-16 text-center">
          <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              500
            </p>
            <h1 className="mt-4 text-3xl font-bold">Etwas ist schiefgelaufen.</h1>
            <p className="mt-4 text-slate-300">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
            </p>
            <button
              className="mt-8 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={() => reset()}
              type="button"
            >
              Erneut versuchen
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
