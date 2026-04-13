export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10">
      {children}
    </div>
  );
}
