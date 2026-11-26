// src/flows/routes.tsx
//
// DESIGNER-OWNED. The declarative route tree: structure and navigation only.
// There is deliberately no `loader` or `guard` field — there's nowhere to put
// logic, which is what keeps this folder safe to own.
//
// /app/router.tsx consumes this tree generically and builds the real router
// from it. Adding a screen = drop a component in src/flows/<name>/ and add an
// entry here. You never touch /app.
//
// Param syntax is `:id` (readable). The bridge in /app translates it to
// TanStack's `$id` — don't write `$id` here.

import type { ComponentType } from "react";
import HomeScreen from "./home/HomeScreen";
import PageStubScreen from "./pages/PageStubScreen";

export type FlowRoute = {
  /** "/" | "loans" | ":id". Nested under the parent's path. */
  path: string;
  /** The screen. Omit on a node that exists purely to group children. */
  component?: ComponentType;
  children?: FlowRoute[];
  /**
   * Design annotation ONLY — grouping/labels for the DevBar and the Flow Map.
   * NOT enforcement: `meta.role: "admin"` restricts nothing.
   * Real role guards are dev's, in /app.
   */
  meta?: {
    role?: string;
    flow?: string;
    label?: string;
    /** Sample values so detail routes are clickable, e.g. { id: "1001" }. */
    sampleParams?: Record<string, string>;
  };
};

export const routes: FlowRoute[] = [
  {
    path: "/",
    component: HomeScreen,
    meta: { role: "visitor", flow: "Home", label: "Home" },
  },
  {
    // Stub destinations for /about, /cv and /contact until they are designed.
    path: ":page",
    component: PageStubScreen,
    meta: {
      role: "visitor",
      flow: "Pages",
      label: "Page (stub)",
      sampleParams: { page: "about" },
    },
  },

  // Your flows go here. Shape reminder — delete this comment, not the pattern:
  //
  // {
  //   path: "loans",
  //   component: LoansListScreen,          // renders at /loans
  //   meta: { role: "underwriter", flow: "Loans", label: "Loans list" },
  //   children: [
  //     {
  //       path: ":id",
  //       component: LoanDetailsScreen,    // renders at /loans/1001
  //       meta: { role: "underwriter", flow: "Loans", label: "Loan details",
  //               sampleParams: { id: "1001" } },
  //     },
  //   ],
  // },
];
