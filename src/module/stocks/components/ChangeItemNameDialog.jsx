import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChangeBulkItemName } from "@/module/changeItemName/hooks/useChangeItemName";

export function ChangeItemNameDialog({
  open,
  onOpenChange,
  currentItemName,
  onSuccess,
}) {
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("");
  const changeBulkItemMutation = useChangeBulkItemName();

  useEffect(() => {
    if (open) {
      setNewItemName("");
    }
  }, [open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const fromName = currentItemName ? String(currentItemName).trim() : "";
    const toName = newItemName ? String(newItemName).trim() : "";

    if (!fromName) {
      toast({
        title: "Validation Error",
        description: "Current item name is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!toName) {
      toast({
        title: "Validation Error",
        description: "Please enter a new name for the item.",
        variant: "destructive",
      });
      return;
    }

    if (fromName.toLowerCase() === toName.toLowerCase()) {
      toast({
        title: "Validation Error",
        description: "New name must be different from the current name.",
        variant: "destructive",
      });
      return;
    }

    changeBulkItemMutation.mutate(
      {
        from_item_name: fromName,
        to_item_name: toName,
      },
      {
        onSuccess: () => {
          setNewItemName("");
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg p-6 border shadow-xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            Change Name of Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* Current Item Name (Read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Current Item Name
            </Label>
            <Input
              value={currentItemName || ""}
              readOnly
              disabled
              className="bg-gray-100 border-gray-200 text-xs h-9 font-medium text-gray-800 cursor-not-allowed"
            />
          </div>

          {/* New Item Name */}
          <div className="space-y-1.5">
            <Label htmlFor="enter_new_name" className="text-xs font-semibold text-gray-700">
              Enter New Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="enter_new_name"
              placeholder="Enter new item name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-white border-gray-300 text-xs h-9"
              autoFocus
            />
          </div>

          <DialogFooter className="pt-3 border-t flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={changeBulkItemMutation.isPending}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={changeBulkItemMutation.isPending || !newItemName.trim()}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 flex items-center gap-1.5"
            >
              {changeBulkItemMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangeItemNameDialog;
