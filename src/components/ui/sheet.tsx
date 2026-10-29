import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

type Side = "left" | "right" | "bottom";
const sideClass: Record<Side, string> = {
  left: "inset-y-0 left-0 h-full w-[min(20rem,88vw)] border-r",
  right: "inset-y-0 right-0 h-full w-[min(24rem,92vw)] border-l",
  bottom: "inset-x-0 bottom-0 max-h-[82dvh] rounded-t-2xl border-t safe-bottom",
};

export function SheetContent({ side = "left", className, children, title, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: Side; title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45" />
      <DialogPrimitive.Content className={cn("fixed z-50 flex flex-col border-border bg-card shadow-xl outline-none", sideClass[side], className)} {...props}>
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <DialogPrimitive.Title className="text-sm font-semibold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
          <DialogPrimitive.Close className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Đóng">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
