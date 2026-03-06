import { serveLocalClone } from "@/lib/local-clone";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  void request;
  const { slug } = await context.params;
  const pathname = `/${slug.join("/")}/`;
  return serveLocalClone(pathname);
}
