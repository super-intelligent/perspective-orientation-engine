export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          PERSPECTIVE{' '}
          <span className="text-emerald-400">ORIENTATION</span>
          {' '}ENGINE
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          A multi-ontology orientation instrument
        </p>
        <p className="text-sm text-emerald-400/80 font-medium max-w-lg mx-auto leading-relaxed">
          &ldquo;The system does not evaluate reality.
          It stabilizes orientation toward it.&rdquo;
        </p>
      </div>
    </main>
  )
}
