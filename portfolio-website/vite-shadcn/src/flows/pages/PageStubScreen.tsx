// src/flows/pages/PageStubScreen.tsx
//
// Visible stub destination (P10) for the pages the home links to but that are
// not designed yet: /about, /cv and /contact. One screen serves all three,
// reading the page name from the route param (P3).

import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const pageTitles: Record<string, string> = {
  about: "About",
  cv: "CV",
  contact: "Contact",
};

export default function PageStubScreen() {
  const { page = "" } = useParams({ strict: false }) as { page?: string };
  const title = pageTitles[page] ?? "Page";

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>This page is not designed yet.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
