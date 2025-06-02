import Head from "next/head";
import { LoginForm } from "~/components/login";
import { Navbar } from "~/components/nav";
import { authClient } from "~/lib/auth-client";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const session = authClient.useSession();

  if (session.isPending) return <></>;

  if (!session.data) {
    return (
      <>
        <Head>
          <title>Sub Tracker - Login</title>
          <meta name="description" content="Track your subscriptions" />
        </Head>
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <LoginForm />
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>FanficTracker</title>
        <meta name="description" content="Track your subscriptions" />
      </Head>
      <main
        className="bg-background relative container mx-auto min-h-screen px-4 pt-8 pb-20
          xl:max-w-5xl"
        data-vaul-drawer-wrapper
      >
        {children}
      </main>
      <Navbar />
    </>
  );
};
