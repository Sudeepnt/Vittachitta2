import PageView from '@/components/PageView';

export const metadata = { title: 'Page not found' };

// Uses the site's existing panel and button styles.
const html = `<section class="pnl" data-label="Not found">
  <div class="wrap pnl-in legal">
    <p class="k">404</p>
    <h1 class="h2">This page does not exist.</h1>
    <p>The link may be old or mistyped.</p>
    <p><a class="btn btn-solid" href="/">Back to home <span class="arr" aria-hidden="true">→</span></a></p>
  </div>
</section>`;

export default function NotFound() {
  return <PageView id="notfound" html={html} />;
}
