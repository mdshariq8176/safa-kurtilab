// Layout wrapper for all dashboard/command center views
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-alabaster flex flex-col font-sans">
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
