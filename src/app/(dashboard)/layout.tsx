export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
       {/* Sidebar or Navbar could go here */}
      {children}
    </section>
  );
}
