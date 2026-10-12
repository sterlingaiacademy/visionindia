export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#F8F9FA] dark:bg-black relative">
      {/* Header Skeleton */}
      <div className="mb-12 flex justify-between items-end">
        <div className="space-y-4 w-full max-w-md">
          <div className="h-10 bg-gray-200 dark:bg-[#111] rounded-2xl w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#111] rounded-xl w-1/2 animate-pulse"></div>
        </div>
        <div className="hidden sm:block h-10 w-32 bg-gray-200 dark:bg-[#111] rounded-full animate-pulse"></div>
      </div>

      {/* Grid Skeleton (Mimics Stats or generic cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl h-36 flex flex-col justify-between animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-3 w-16 bg-gray-200 dark:bg-[#111] rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-[#111] rounded-2xl"></div>
            </div>
            <div className="h-8 w-1/2 bg-gray-200 dark:bg-[#111] rounded-xl mt-4"></div>
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-[#111] rounded-full mt-2"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="mb-10 bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 rounded-3xl h-[400px] animate-pulse p-8 flex flex-col gap-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-[#111] rounded-xl"></div>
        <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl"></div>
      </div>

      {/* Floating Sync Indicator */}
      <div className="fixed bottom-8 right-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full py-3 px-5 flex items-center gap-4 shadow-2xl z-50 backdrop-blur-xl">
        <div className="relative w-5 h-5 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="text-gray-600 dark:text-gray-300 font-bold tracking-widest uppercase text-[10px]">
          Syncing Live Data...
        </div>
      </div>
    </div>
  );
}
