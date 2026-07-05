import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: 'terms' },
    { slug: 'privacy' },
    { slug: 'refund' },
    { slug: 'shipping' },
  ];
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;

  // Validate slug to prevent directory traversal
  const validSlugs = ['terms', 'privacy', 'refund', 'shipping'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'src', 'content', 'policies', `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const htmlContent = await marked.parse(fileContent);

    const titles: Record<string, string> = {
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      refund: 'Return & Refund Policy',
      shipping: 'Shipping & Delivery Policy',
    };
    const pageTitle = titles[slug] || 'Policy Page';

    return (
      <main className="min-h-screen bg-[#fbfbf9] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-gold-primary/10 rounded-2xl shadow-sm p-8 sm:p-12">
          <div className="text-center mb-10 border-b border-gold-primary/10 pb-6">
            <span className="text-gold-dark font-bold text-xs tracking-widest uppercase">Legal Documentation</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">{pageTitle}</h1>
            <div className="w-12 h-0.5 bg-gold-primary mx-auto mt-4" />
          </div>
          <div 
            className="policy-content font-sans text-charcoal/80 leading-relaxed space-y-6 [&>h1]:hidden [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-charcoal [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:font-serif [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-emerald-primary [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:text-sm [&>li]:leading-relaxed [&>hr]:my-8 [&>hr]:border-gold-primary/10"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error rendering policy page:', error);
    notFound();
  }
}
