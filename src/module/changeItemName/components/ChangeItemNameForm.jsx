import React, { useState } from "react";
import { RefreshCw, Loader2, ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useProductList,
  useChangeBulkItemName,
} from "../hooks/useChangeItemName";

export function ChangeItemNameForm() {
  const { toast } = useToast();
  const { data: products = [], isLoading: isLoadingProducts } = useProductList();
  const changeBulkItemMutation = useChangeBulkItemName();

  const [fromItemName, setFromItemName] = useState("");
  const [customFromItemName, setCustomFromItemName] = useState("");
  const [useCustomFrom, setUseCustomFrom] = useState(false);
  const [toItemName, setToItemName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedFrom = useCustomFrom ? customFromItemName.trim() : fromItemName.trim();
    const selectedTo = toItemName.trim();

    if (!selectedFrom) {
      toast({
        title: "Validation Error",
        description: "Please select or enter the current item name.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTo) {
      toast({
        title: "Validation Error",
        description: "Please enter the new item name.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFrom === selectedTo) {
      toast({
        title: "Validation Error",
        description: "From Item Name and To Item Name cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    changeBulkItemMutation.mutate(
      {
        from_item_name: selectedFrom,
        to_item_name: selectedTo,
      },
      {
        onSuccess: () => {
          setFromItemName("");
          setCustomFromItemName("");
          setToItemName("");
        },
      }
    );
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header Section matching App Theme */}
      <div className="flex items-center gap-3 border-b pb-4 bg-white/40 backdrop-blur-md rounded-lg p-4 shadow-xs">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <RefreshCw className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Change Item Name
          </h1>
          <p className="text-xs text-gray-500">
            Bulk rename an existing item across all records (Sales, Purchases, Stocks, Estimates)
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-xs border rounded-lg bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Bulk Rename Details
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Select or type the current item name and specify the new name to replace it everywhere.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Item Name Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="from_item_name" className="text-xs font-semibold text-gray-700">
                  From Item Name (Existing Name) <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomFrom(!useCustomFrom);
                    setFromItemName("");
                    setCustomFromItemName("");
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  {useCustomFrom ? "Select from list" : "Enter manually"}
                </button>
              </div>

              {useCustomFrom ? (
                <Input
                  id="custom_from_item_name"
                  placeholder="Enter existing item name..."
                  value={customFromItemName}
                  onChange={(e) => setCustomFromItemName(e.target.value)}
                  className="bg-white border-gray-200 text-xs h-9"
                />
              ) : (
                <Select
                  value={fromItemName}
                  onValueChange={setFromItemName}
                  disabled={isLoadingProducts}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 text-xs h-9">
                    <SelectValue
                      placeholder={
                        isLoadingProducts
                          ? "Loading item list..."
                          : "Select existing item name"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((item, index) => {
                      const name =
                        item.product_type_name ||
                        item.name ||
                        item.item_name ||
                        item.product_name;
                      if (!name) return null;
                      return (
                        <SelectItem key={index} value={String(name)} className="text-xs">
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Down Arrow separator */}
            <div className="flex justify-center py-1">
              <ArrowDown className="h-5 w-5 text-blue-500" />
            </div>

            {/* To Item Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="to_item_name" className="text-xs font-semibold text-gray-700">
                To Item Name (New Name) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="to_item_name"
                placeholder="Enter new item name..."
                value={toItemName}
                onChange={(e) => setToItemName(e.target.value)}
                className="bg-white border-gray-200 text-xs h-9"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromItemName("");
                  setCustomFromItemName("");
                  setToItemName("");
                }}
                disabled={changeBulkItemMutation.isPending}
                className="text-xs h-8 px-4"
              >
                Reset
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={changeBulkItemMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 font-medium flex items-center gap-1.5"
              >
                {changeBulkItemMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Change Item Name
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChangeItemNameForm;
