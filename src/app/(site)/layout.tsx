import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { RevealObserver } from "@/components/ui/Reveal";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main"
        className="bg-accent text-accent-ink sr-only rounded-full px-5 py-3 font-semibold focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <RevealObserver />
    </>
  );
}
