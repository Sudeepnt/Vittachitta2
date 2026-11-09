// Server component: the page's markup ships as plain HTML, no client JS.
export default function PageView({ id, html }: { id: string; html: string }) {
  return <main className="view" data-view={id} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
