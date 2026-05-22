import { HeroSkeleton, RailSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <>
      <HeroSkeleton />
      <div className="bg-paper pt-10">
        <RailSkeleton />
        <RailSkeleton />
      </div>
    </>
  );
}
