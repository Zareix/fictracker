import {
  BookCopyIcon,
  BookMarkedIcon,
  HomeIcon,
  PlusCircleIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CreateFanficDialog } from "~/components/fanfics/create";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const NAV_ITEMS = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Shelves",
    url: "/shelves",
    icon: BookMarkedIcon,
  },
  {
    title: "All fanfics",
    url: "/fanfics",
    icon: BookCopyIcon,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon,
  },
] as const;

const NavbarItem = ({
  pathname,
  ...item
}: (typeof NAV_ITEMS)[number] & {
  pathname: string;
}) => (
  <Button
    key={item.title}
    asChild
    variant="link"
    className={cn(pathname === item.url ? "text-primary" : "text-foreground")}
  >
    <Link
      href={item.url}
      className="flex h-full items-center justify-center gap-2 text-xl font-bold"
    >
      <item.icon size={26} />
    </Link>
  </Button>
);

export const Navbar = () => {
  const router = useRouter();

  const navBarItems = NAV_ITEMS;
  const middleIndex = Math.floor(navBarItems.length / 2);
  return (
    <nav
      className="border-border bg-background/80 fixed right-0 bottom-0 left-0 z-10 flex h-14
        items-center justify-between border-t px-4 backdrop-blur md:px-8"
    >
      <div className="grid h-full w-full grid-cols-5 content-center items-center justify-around gap-2">
        {navBarItems
          .filter((_, i) => i < middleIndex)
          .map((item) => (
            <NavbarItem key={item.title} {...item} pathname={router.pathname} />
          ))}
        <CreateFanficDialog
          trigger={
            <Button
              variant="link"
              className="text-foreground flex h-full items-center gap-2"
            >
              <PlusCircleIcon size={26} />
            </Button>
          }
        />
        {navBarItems
          .filter((_, i) => i >= middleIndex)
          .map((item) => (
            <NavbarItem key={item.title} {...item} pathname={router.pathname} />
          ))}
      </div>
    </nav>
  );
};
