// src/flows/home/HomeScreen.tsx
//
// The portfolio home: the Hero v2 design from Figma, built in code.
// Data arrives as props with mock defaults (P4); the screen stays "dumb".
//
// Layout in one breath: nav on top, a black-and-white portrait bleeding off the
// bottom edge of the first viewport on the right, the text block vertically
// centred on the left, and the top of the first case-study card peeking in at
// the bottom of the viewport to signal that work follows. Below `lg` the page
// stacks: portrait (head and shoulders) first, then text, then full-width CTAs.

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Heading, Text } from "@/shared/ui/typography";

type NavItem = { label: string; href: string };

type Profile = {
  name: string;
  role: string;
  /** Headline split around the highlighted words. */
  headline: { before: string; highlight: string; after: string };
  summary: string;
  primaryCta: NavItem;
  secondaryCta: NavItem;
  portrait: { src: string; alt: string };
  nextWork: { label: string; index: string };
};

const defaultNav: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "About", href: "/about" },
  { label: "CV ↗", href: "/cv" },
  { label: "Contact", href: "/contact" },
];

const defaultProfile: Profile = {
  name: "Yuliya Babkina",
  role: "Senior Product Designer",
  headline: {
    before: "I gently untangle years of ",
    highlight: "UX debt",
    after: " in complex products.",
  },
  summary:
    "7+ years across enterprise, healthcare and consumer apps. Currently core designer on a Swiss B2B platform, leading a 0→1 product and its design system.",
  primaryCta: { label: "View my work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "/contact" },
  portrait: { src: "/images/portrait.jpg", alt: "Portrait of Yuliya Babkina" },
  nextWork: { label: "Selected work", index: "01" },
};

type Props = {
  /** Mock default so the screen renders standalone. Dev overrides it later. */
  navItems?: NavItem[];
  profile?: Profile;
};

/** In-page anchors are plain links; everything else is a router link. */
function PageLink({
  href,
  children,
  ...props
}: { href: string; children: ReactNode; className?: string }) {
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}

export default function HomeScreen({ navItems = defaultNav, profile = defaultProfile }: Props) {
  const { headline } = profile;

  return (
    <main className="relative isolate overflow-x-clip bg-background text-foreground">
      {/* Nav — 104px high on large screens (peek math below depends on it). */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 lg:px-24 lg:py-10">
        <Button
          asChild
          variant="link"
          className="h-auto p-0 text-lg leading-6 font-medium tracking-tight text-foreground hover:no-underline lg:text-xl"
        >
          <PageLink href="/">{profile.name}</PageLink>
        </Button>

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item.label}
              asChild
              variant="link"
              className="h-auto p-0 text-base leading-6 font-normal text-foreground"
            >
              <PageLink href={item.href}>{item.label}</PageLink>
            </Button>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="link"
              className="h-auto p-0 text-base leading-6 font-normal text-foreground lg:hidden"
            >
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{profile.name}</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-2 px-4">
              {navItems.map((item) => (
                <SheetClose key={item.label} asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-12 justify-start px-3 text-lg font-medium"
                  >
                    <PageLink href={item.href}>{item.label}</PageLink>
                  </Button>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Portrait — in flow on small screens, a viewport-high clip box on large
          ones so the portrait bleeds off the bottom edge of the first screen. */}
      <div className="relative mx-auto h-[380px] max-w-md overflow-hidden lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-0 lg:mx-0 lg:h-svh lg:max-w-none">
        <img
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          width={1660}
          height={2206}
          className="absolute -top-[8%] -left-[18.5%] w-[133%] max-w-none lg:top-[16%] lg:right-0 lg:left-auto lg:w-[48%]"
        />
      </div>

      {/* Text block — vertically centred in the space between nav and peek. */}
      <section
        aria-label="Introduction"
        className="relative z-10 flex flex-col px-6 pt-8 pb-12 lg:min-h-[calc(100svh-13rem)] lg:justify-center lg:px-24 lg:py-0"
      >
        <div className="flex flex-col items-start">
          <div className="flex flex-col gap-4">
            <Text variant="eyebrow">{profile.role}</Text>
            <Heading level="display" className="isolate">
              {headline.before}
              <br className="hidden xl:block" />
              <span className="relative whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-[0.11em] bottom-[0.04em] -z-10 h-[0.72em] rounded-[0.06em] bg-highlight"
                />
                {headline.highlight}
              </span>
              {headline.after}
            </Heading>
          </div>

          <Text variant="intro" className="mt-8 max-w-[35rem]">
            {profile.summary}
          </Text>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Button
              asChild
              variant="highlight"
              size="xl"
              className="w-full sm:w-auto"
            >
              <PageLink href={profile.primaryCta.href}>{profile.primaryCta.label}</PageLink>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full border-[1.5px] border-foreground bg-transparent sm:w-auto"
            >
              <PageLink href={profile.secondaryCta.href}>{profile.secondaryCta.label}</PageLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Next case study — its top 104px peeks into the first viewport. */}
      <section
        id="work"
        aria-label={profile.nextWork.label}
        className="relative z-10 px-6 lg:px-24"
      >
        <Card className="min-h-[28rem] rounded-b-none rounded-t-3xl ring-0 [--card-spacing:--spacing(8)]">
          <CardHeader className="flex items-start justify-between">
            <Text variant="muted" className="text-base font-medium">
              {profile.nextWork.label}
            </Text>
            <Text variant="muted" className="text-base font-medium">
              {profile.nextWork.index}
            </Text>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
