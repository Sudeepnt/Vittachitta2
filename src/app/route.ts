import { serveLocalClone } from "@/lib/local-clone";

export async function GET(request: Request) {
  void request;
  return serveLocalClone("/");
}
