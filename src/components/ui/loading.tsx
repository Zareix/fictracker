import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

export const Loading = (props: React.ComponentProps<typeof Loader2Icon>) => {
  return (
    <Loader2Icon
      {...props}
      className={cn(
        "mx-auto h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-white",
        props.className,
      )}
    />
  );
};
