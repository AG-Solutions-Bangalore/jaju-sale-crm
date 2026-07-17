import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductById, useUpdateProduct } from "../hooks/useProduct";

const ProductEditDialog = ({ productId }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product_type: "",
    product_type_group: "",
    product_type_status: "",
    openpurch_pcs: "",
    openpurch_sqr: "",
    closesale_pcs: "",
    closesale_sqr: "",
  });

  const { data: prodData, isFetching } = useProductById(open ? productId : null);
  const updateMutation = useUpdateProduct(productId);

  useEffect(() => {
    if (prodData) {
      setFormData({
        product_type: prodData.product_type || "",
        product_type_group: prodData.product_type_group || "",
        product_type_status: prodData.product_type_status || "",
        openpurch_pcs: prodData.openpurch_pcs?.toString() || "",
        openpurch_sqr: prodData.openpurch_sqr?.toString() || "",
        closesale_pcs: prodData.closesale_pcs?.toString() || "",
        closesale_sqr: prodData.closesale_sqr?.toString() || "",
      });
    }
  }, [prodData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      product_type_status: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.product_type ||
      !formData.product_type_group ||
      !formData.product_type_status
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(formData, {
      onSuccess: (res) => {
        if (res.data.code == 200) {
          setOpen(false);
        }
      },
    });
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Product</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product_type_group">
                Product Type<span className="text-xs text-red-400 ">*</span>
              </Label>
              <Input
                id="product_type_group"
                name="product_type_group"
                value={formData.product_type_group}
                onChange={handleInputChange}
                placeholder="Enter Product Type"
                maxLength={50}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product_type">
                Product <span className="text-xs text-red-400 ">*</span>
              </Label>
              <Input
                id="product_type"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                placeholder="Enter Product Name "
                maxLength={50}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product_type_status">
                Status <span className="text-xs text-red-400 ">*</span>
              </Label>
              <Tabs
                value={formData.product_type_status}
                onValueChange={handleStatusChange}
              >
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger
                    value="Active"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="Inactive"
                    className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
                  >
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="border-t pt-3 mt-2">
              <h4 className="text-xs font-bold text-blue-900 mb-3 uppercase tracking-wider">Opening Stock & Historical Data</h4>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border">
                <div className="grid gap-1">
                  <Label htmlFor="openpurch_pcs" className="text-xs">Opening Pieces</Label>
                  <Input
                    id="openpurch_pcs"
                    name="openpurch_pcs"
                    type="number"
                    value={formData.openpurch_pcs}
                    onChange={handleInputChange}
                    placeholder="Pieces"
                    className="bg-white text-xs h-8"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="openpurch_sqr" className="text-xs">Opening SQFT</Label>
                  <Input
                    id="openpurch_sqr"
                    name="openpurch_sqr"
                    type="number"
                    value={formData.openpurch_sqr}
                    onChange={handleInputChange}
                    placeholder="SQFT"
                    className="bg-white text-xs h-8"
                  />
                </div>
                <div className="grid gap-1 mt-2">
                  <Label htmlFor="closesale_pcs" className="text-xs">Prev Year Sale Pcs</Label>
                  <Input
                    id="closesale_pcs"
                    name="closesale_pcs"
                    type="number"
                    value={formData.closesale_pcs}
                    onChange={handleInputChange}
                    placeholder="Pieces"
                    className="bg-white text-xs h-8"
                  />
                </div>
                <div className="grid gap-1 mt-2">
                  <Label htmlFor="closesale_sqr" className="text-xs">Prev Year Sale SQFT</Label>
                  <Input
                    id="closesale_sqr"
                    name="closesale_sqr"
                    type="number"
                    value={formData.closesale_sqr}
                    onChange={handleInputChange}
                    placeholder="SQFT"
                    className="bg-white text-xs h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
