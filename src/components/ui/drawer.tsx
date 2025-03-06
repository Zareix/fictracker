"use client";

import type * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "~/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);

const DrawerNestedRoot = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) => (
  <DrawerPrimitive.NestedRoot {...props} />
);

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) => (
  <DrawerPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
);

const DrawerContent = ({
  withOverlay = true,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  withOverlay?: boolean;
}) => (
  <DrawerPortal>
    {withOverlay && <DrawerOverlay />}
    <DrawerPrimitive.Content
      className={cn(
        `bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[90vh]
        flex-col rounded-t-md border transition-all`,
        className,
      )}
      {...props}
    >
      <div className="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" />
      <div className="grid gap-4 overflow-y-auto p-4">{children}</div>
    </DrawerPrimitive.Content>
  </DrawerPortal>
);

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 px-4 text-center sm:text-left", className)}
    {...props}
  />
);

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 py-4", className)}
    {...props}
  />
);

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) => (
  <DrawerPrimitive.Title
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
);

const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) => (
  <DrawerPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export {
  Drawer,
  DrawerPortal,
  DrawerNestedRoot,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
