import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import Providers from "../providers/providers";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/error-reporting";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          This page is encrypted beyond recovery
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find that route in the registry.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Something broke during decryption
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again, or head back to the landing page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Confidential Registry — Discover, Shield, Transfer, Decrypt" },
      {
        name: "description",
        content:
          "Discover ERC20 ↔ ERC7984 wrapper pairs from the on-chain registry and interact with confidential assets using Zama FHEVM.",
      },
      { name: "theme-color", content: "#040816" },
      { property: "og:title", content: "Confidential Registry" },
      {
        property: "og:description",
        content:
          "A confidential asset protocol powered by Zama FHEVM. Discover wrappers, shield ERC20s into ERC7984, transfer privately and decrypt on demand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
     
<QueryClientProvider client={queryClient}>
      <Providers>
        <TooltipProvider>

          <Outlet />
             <Toaster
            richColors
            position="top-right"
            closeButton
            expand={false}
          />
        </TooltipProvider>
      </Providers>
    </QueryClientProvider>
   
  );
}
