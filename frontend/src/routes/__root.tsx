import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/aris/Toaster";
import { AlertBanner } from "@/components/aris/AlertBanner";
import { BootScreen } from "@/components/aris/BootScreen";
import { NotFound } from "@/components/aris/NotFound";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass p-8">
        <h1 className="font-display text-xl text-danger">SYSTEM FAULT</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-5 py-2 border border-cyan/50 text-cyan font-display tracking-widest text-xs hover:bg-cyan/10">RETRY</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <BootScreen />
      <AlertBanner />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
