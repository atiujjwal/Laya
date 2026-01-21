import { Navbar } from '@/components/layout/navbar';
import { OnboardingModal } from '@/components/organisms/OnboardingModal'; // Add this import

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Global Modals */}
      <OnboardingModal />

      <main className="flex-1 container py-6">{children}</main>

      <footer className="h-12 border-t flex items-center justify-center text-sm text-muted-foreground bg-neutral-100">
        © 2026 Laya Habit Tracker
      </footer>
    </div>
  );
}
