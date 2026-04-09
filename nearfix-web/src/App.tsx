function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-12">
          <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            NearFix Setup Complete
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Book trusted local skilled workers in minutes
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            React, Vite, TypeScript, and Tailwind are configured. This starter screen confirms the project initialization checklist is working before feature development begins.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Frontend</p>
              <p className="text-lg font-semibold text-slate-800">React + Vite</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Language</p>
              <p className="text-lg font-semibold text-slate-800">TypeScript</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Styling</p>
              <p className="text-lg font-semibold text-slate-800">Tailwind CSS</p>
            </div>
          </div>

          <button className="mt-8 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            Continue to Step 2
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
