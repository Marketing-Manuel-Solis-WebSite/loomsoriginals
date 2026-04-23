import { SeriesForm } from "../../SeriesForm";

export default function NewSeriesPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Series</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Nueva serie</h1>
      <div className="mt-8 max-w-3xl">
        <SeriesForm />
      </div>
    </div>
  );
}
