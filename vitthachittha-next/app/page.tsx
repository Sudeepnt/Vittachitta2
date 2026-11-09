import PageView from '@/components/PageView';
import { getPage } from '@/lib/content';

export const dynamic = 'force-static';

export default function Home() {
  return <PageView id="home" html={getPage('home')!.html} />;
}
