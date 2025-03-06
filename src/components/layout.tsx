import Head from "next/head";
import { Navbar } from "~/components/nav";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  // const session = useSession();

  // if (session.isPending) return <></>;

  // if (!session.data) {
  //   return (
  //     <>
  //       <Head>
  //         <title>Sub Tracker - Login</title>
  //         <meta name="description" content="Track your subscriptions" />
  //       </Head>
  //       <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  //         <div className="flex w-full max-w-sm flex-col gap-6">
  //           <LoginForm />
  //         </div>
  //       </main>
  //     </>
  //   );
  // }

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
