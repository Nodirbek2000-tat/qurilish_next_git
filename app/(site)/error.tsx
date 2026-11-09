"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-x flex min-h-[70vh] flex-col justify-center pt-32 pb-20">
      <p className="eyebrow">Xatolik</p>
      <h1 className="h-display mt-5 text-[clamp(40px,7vw,96px)]">Nimadir noto&apos;g&apos;ri ketdi</h1>
      <p className="mt-6 max-w-md text-lg text-muted">Sahifani yuklab bo&apos;lmadi. Birozdan keyin qayta urinib ko&apos;ring.</p>
      <div className="mt-10">
        <button onClick={reset} className="btn btn-ink">Qayta urinish</button>
      </div>
    </section>
  );
}
