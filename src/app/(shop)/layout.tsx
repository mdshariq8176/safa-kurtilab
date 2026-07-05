// Layout wrapper for all customer-facing storefront pages
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
