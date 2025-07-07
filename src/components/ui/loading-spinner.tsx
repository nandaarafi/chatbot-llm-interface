import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
}

const LoadingSpinner = React.forwardRef<
  HTMLSpanElement,
  LoadingSpinnerProps
>(({ className, text, ...props }, ref) => {
  return (
    <span className={cn("flex items-center", className)} {...props} ref={ref}>
      <Loader className="mr-2 size-4 animate-spin" />
      {text}
    </span>
  );
});
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
