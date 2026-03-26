import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-background selection:bg-primary/30">
      {/* Background Ambient Lights */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 md:px-12 flex items-center justify-between glass-surface border-b border-white/5 transition-all">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
          StreamFlow
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="#features" className="hover:text-white transition-colors">Características</Link>
          <Link href="#experience" className="hover:text-white transition-colors">Experiencia</Link>
        </nav>
        <Link 
          href="/login"
          className="btn-secondary px-6 py-2 text-sm text-text-primary hover:text-white transition-colors rounded-full"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-24 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 max-w-5xl text-white drop-shadow-2xl leading-[1.1]">
            El Futuro del <br/>
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              Entretenimiento.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Una experiencia cinemática impulsada por IA. 
            Calidad sin límites, en todos tus dispositivos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="btn-primary text-white font-semibold text-lg px-8 py-4 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 group w-full sm:w-auto"
            >
              Comienza gratis
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link 
              href="#features" 
              className="btn-secondary text-text-primary hover:text-white font-semibold text-lg px-8 py-4 rounded-full transition-all w-full sm:w-auto"
            >
              Descubre más
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up delay-200">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-surface border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <img 
              src="/images/devices.png" 
              alt="StreamFlow Devices" 
              className="w-full h-full object-cover opacity-90 hover:scale-[1.03] transition-transform duration-1000 ease-out"
            />
          </div>
        </div>
      </section>

      {/* Features Bento Box */}
      <section id="features" className="relative z-10 py-32 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20 animate-fade-in-up md:mt-24">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">Diseñado para sorprender.</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light">Todo lo que amas, con una interfaz revolucionaria.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {/* Card 1 */}
          <div className="md:col-span-2 glass-surface rounded-3xl p-10 relative overflow-hidden group border border-white/5 hover:border-primary/50 transition-colors">
            <div className="relative z-20 h-full flex flex-col justify-end">
              <h3 className="text-3xl font-bold mb-3 text-white">Antologías IA</h3>
              <p className="text-text-secondary text-lg max-w-md">Contenido infinito generado inteligentemente, adaptado a tus gustos en tiempo real con modelado predictivo.</p>
            </div>
            <div className="absolute top-0 right-0 w-full h-full md:w-3/4 mask-image-gradient">
                <img src="/images/bento.png" className="w-full h-full object-cover opacity-60 group-hover:scale-[1.02] group-hover:opacity-80 transition-all duration-700" alt="Bento UI" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10" />
          </div>

          {/* Card 2 */}
          <div className="glass-surface rounded-3xl p-10 relative overflow-hidden group border border-white/5 hover:border-secondary/50 transition-colors flex flex-col justify-between">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)] mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-3 text-white">Velocidad Extrema</h3>
              <p className="text-text-secondary">Carga instantánea en 4K HDR. Nuestra infraestructura global garantiza cero interrupciones.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-surface rounded-3xl p-10 relative overflow-hidden group border border-white/5 hover:border-primary/50 transition-colors flex flex-col justify-between">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-3 text-white">Privacidad Total</h3>
              <p className="text-text-secondary">No vendemos tus datos. Toda tu visión es privada y encriptada de extremo a extremo.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 glass-surface rounded-3xl p-10 relative overflow-hidden group border border-white/5 hover:border-secondary/50 transition-colors bg-gradient-to-br from-surface to-primary/10">
            <div className="relative z-20 w-full md:w-3/5 h-full flex flex-col justify-center">
              <h3 className="text-4xl font-extrabold mb-4 text-white">Sincronización Total.</h3>
              <p className="text-text-secondary text-lg">Continúa tu serie exactamente donde la dejaste, en cualquier pantalla que prefieras. Handoff de dispositivos en milisegundos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 px-4 text-center border-t border-white/5 bg-gradient-to-b from-transparent to-primary/5">
        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white drop-shadow-xl">Listo para el siguiente nivel?</h2>
        <Link 
          href="/login" 
          className="bg-white text-black font-semibold text-xl px-12 py-5 rounded-full inline-block shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
        >
          Crea tu cuenta gratis
        </Link>
      </section>
    </main>
  );
}
