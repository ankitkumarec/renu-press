/** Standalone auth — NO public website navbar */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050814] text-white">
      {children}
    </div>
  );
}
