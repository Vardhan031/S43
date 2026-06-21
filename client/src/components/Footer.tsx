"use client";

export default function Footer() {
  return (
    <footer className="border-t border-orange-500/10 py-8 text-sm text-neutral-600" style={{ background: "#050505" }}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="font-black text-neutral-500 tracking-wider uppercase text-xs">S43</p>
        <p className="text-neutral-700">©S43 Official Tournaments</p>
      </div>
    </footer>
  );
}

