import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * ConfirmDialog — a reusable confirmation dialog built on shadcn/ui primitives.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete item"
 *     description="This action cannot be undone."
 *     onConfirm={handleDelete}
 *   />
 *
 * Note: If onConfirm throws, the dialog will still close. If you want to keep
 * it open on error, manage the `loading` prop externally and call onOpenChange
 * yourself after handling the error.
 *
 * Personal note: changed default confirmVariant to "default" since most of my
 * use cases are not destructive actions (e.g. confirmations, not deletions).
 * Change back to "destructive" if wiring up delete flows.
 *
 * Personal note: added `closeOnBackdropClick` prop (default: false) so that
 * accidental clicks outside the dialog don't dismiss it mid-flow. Learned this
 * the hard way after losing form state a few times.
 *
 * Personal note: also block Escape key from closing the dialog when loading is
 * true — had a case where pressing Escape mid-async-op left the UI in a broken
 * state because the confirm handler was still running.
 */

export interface ConfirmDialogProps {
  /** Controls whether the dialog is visible. */
  open: boolean;
  /** Called when the dialog requests to change its open state. */
  onOpenChange: (open: boolean) => void;
  /** Dialog heading text. */
  title?: string;
  /** Descriptive body text shown below the title. */
  description?: string;
  /** Label for the confirm button (default: "Confirm"). */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel"). */
  cancelLabel?: string;
  /** Variant applied to the confirm button (default: "default"). */
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Called when the user clicks the confirm button. */
  onConfirm: () => void | Promise<void>;
  /** Called when the user clicks the cancel button. */
  onCancel?: () => void;
  /** When true the confirm button shows a loading spinner and is disabled. */
  loading?: boolean;
  /**
   * When true, clicking outside the dialog (backdrop) will close it.
   * Defaults to false to prevent accidental dismissal.
   */
  closeOnBackdropClick?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  onConfirm,
  onCancel,
  loading = false,
  closeOnBackdropClick = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      // Close the dialog whether onConfirm succeeded or threw.
      // To keep it open on error, manage state externally via the loading prop.
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    // While a loading operation is in progress, never allow the dialog to close
    // via backdrop click or Escape — prevents broken UI state mid-async-op.
    if (loading) return;

    // If closing (next === false) and backdrop clicks are disabled, bail out.
    if (!next && !closeOnBackdropClick) return;

    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Loading…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
