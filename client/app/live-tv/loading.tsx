import LiveTvSkeletonGrid, { LiveTvSkeletonPlayer } from "@/components/live-tv/LiveTvSkeletonGrid";

export default function LiveTvLoading() {
  return (
    <div>
      <section className="browse-hero-bg px-6 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="skeleton h-[280px] rounded-2xl" />
          <div className="mt-6 skeleton h-24 rounded-2xl" />
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-10">
        <div className="mb-10">
          <LiveTvSkeletonPlayer />
        </div>
        <LiveTvSkeletonGrid />
      </div>
    </div>
  );
}
