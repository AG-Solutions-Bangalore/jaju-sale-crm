import React from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NotInListIcon from "@/components/common/NotInListIcon";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const MobileEstimateForm = ({
  form,
  itemEntries,
  handleItemChange,
  addItemEntry,
  removeItemEntry,
  handleChargeChange,
  handleAdvanceChange,
  handleCancel,
  handleFormSubmit,
  estimateRef,
  productTypeGroup = [],
  subItemOptions = [],
  handleKeyDown,
  typeOptions,
  loadingType = "Loading Only",
  setLoadingType,
  isSubmitting,
  productOptions = [],
  customItems = {},
  isCustomItem = {},
  handleCustomItemChange,
  handleToggleCustomItem,
  amountToBeCollected,
  displayGrandTotal,
  autoGst18,
  setSaveAction,
}) => {
  return (
    <div className="sm:hidden">
      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <h1 className="text-base font-bold">Add Estimate</h1>
          </button>
          <div className="text-sm font-medium">
            Ref: <span className="font-bold">{estimateRef}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-100 rounded-md p-2">
            <p className="text-xs text-green-800 font-medium">Gross</p>
            <p className="text-sm font-bold">
              {form.watch("estimate_gross") || 0}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-md p-2">
            <p className="text-xs text-red-800 font-medium">Balance</p>
            <p className="text-sm font-bold">
              {form.watch("estimate_balance") || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-14">
        <form id="estimate-form-mobile" onSubmit={handleFormSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mob_estimate_date">Date</Label>
                <Input
                  id="mob_estimate_date"
                  type="date"
                  {...form.register("estimate_date")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_customer">Customer Name</Label>
                <Input
                  id="mob_estimate_customer"
                  {...form.register("estimate_customer")}
                  className="mt-1"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_mobile">Mobile No</Label>
                <Input
                  id="mob_estimate_mobile"
                  {...form.register("estimate_mobile")}
                  className="mt-1"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_address">Address</Label>
                <Input
                  id="mob_estimate_address"
                  {...form.register("estimate_address")}
                  className="mt-1"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Items</h3>
            </div>
            {itemEntries.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2"
              >
                <div className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-11">
                    <div className="mb-1">
                      <div className="flex gap-1 items-center">
                        {isCustomItem[index] ? (
                          <div className="flex-1 flex gap-1">
                            <Input
                              type="text"
                              className="h-8 text-sm uppercase placeholder:normal-case bg-white"
                              placeholder="Enter Item Name"
                              value={customItems[index] || ""}
                              onChange={(e) =>
                                handleCustomItemChange(
                                  index,
                                  e.target.value.toUpperCase()
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs whitespace-nowrap shrink-0 px-2"
                              onClick={() => handleToggleCustomItem(index)}
                            >
                              Select
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <MemoizedProductSelect
                                value={entry.estimate_sub_item}
                                onChange={(value) =>
                                  handleItemChange(index, "estimate_sub_item", value)
                                }
                                options={productOptions}
                                placeholder="Select item"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 whitespace-nowrap shrink-0 px-2"
                              onClick={() => handleToggleCustomItem(index)}
                            >
                              <NotInListIcon className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_qnty", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white px-1 text-center"
                          placeholder="Pcs/Box"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty_sqr}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "estimate_sub_qnty_sqr",
                              e.target.value
                            )
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white px-1 text-center"
                          placeholder="Sqft"
                          maxLength={10}
                        />
                      </div>
                      {/* <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_pcs}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "estimate_sub_pcs",
                              e.target.value
                            )
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white px-1 text-center"
                          placeholder="Pcs"
                          maxLength={10}
                        />
                      </div> */}
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_rate}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_rate", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white px-1 text-center"
                          placeholder="Rate"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="mt-1">
                      <Input
                        type="tel"
                        value={entry.estimate_sub_amount}
                        disabled
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm bg-gray-100 font-semibold"
                        placeholder="Amount"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemEntry(index)}
                      disabled={itemEntries.length <= 1}
                      className="h-7 w-7 hover:bg-gray-200 text-red-500"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItemEntry}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Charges */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Charges</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="mob_estimate_tempo">Tempo Charges</Label>
                <Input
                  id="mob_estimate_tempo"
                  type="tel"
                  {...form.register("estimate_tempo")}
                  onChange={(e) =>
                    handleChargeChange("estimate_tempo", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_loading">Labour Charges</Label>
                <SelectShadcn
                  value={loadingType}
                  onValueChange={(val) => {
                    if (setLoadingType) setLoadingType(val);
                    if (val === "Loading Only") {
                      form.setValue("estimate_unloading", "");
                    } else {
                      form.setValue("estimate_loading", "");
                    }
                    handleChargeChange(
                      val === "Loading Only"
                        ? "estimate_loading"
                        : "estimate_unloading",
                      form.watch(
                        val === "Loading Only"
                          ? "estimate_loading"
                          : "estimate_unloading"
                      ) || "0"
                    );
                  }}
                >
                  <SelectTrigger className="w-full bg-white mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loading Only">Loading Only</SelectItem>
                    <SelectItem value="Loading & Unloading">
                      Loading & Unloading
                    </SelectItem>
                  </SelectContent>
                </SelectShadcn>
                <Input
                  id={
                    loadingType === "Loading Only"
                      ? "mob_estimate_loading"
                      : "mob_estimate_unloading"
                  }
                  type="tel"
                  value={
                    form.watch(
                      loadingType === "Loading Only"
                        ? "estimate_loading"
                        : "estimate_unloading"
                    ) || ""
                  }
                  onChange={(e) => {
                    handleChargeChange(
                      loadingType === "Loading Only"
                        ? "estimate_loading"
                        : "estimate_unloading",
                      e.target.value
                    );
                  }}
                  className="mt-1 text-right"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_other_label">Other Charges 1 Label</Label>
                <Input
                  id="mob_estimate_other_label"
                  type="text"
                  placeholder="Other Charges 1"
                  className="mt-1"
                  {...form.register("estimate_other_label")}
                />
                <Input
                  id="mob_estimate_other"
                  type="tel"
                  {...form.register("estimate_other")}
                  onChange={(e) =>
                    handleChargeChange("estimate_other", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right"
                  maxLength={10}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_other1_label">Other Charges 2 Label</Label>
                <Input
                  id="mob_estimate_other1_label"
                  type="text"
                  placeholder="Other Charges 2"
                  className="mt-1"
                  {...form.register("estimate_other1_label")}
                />
                <Input
                  id="mob_estimate_other1"
                  type="tel"
                  {...form.register("estimate_other1")}
                  onChange={(e) =>
                    handleChargeChange("estimate_other1", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right"
                  maxLength={10}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Totals</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="mob_estimate_gross">Gross Total</Label>
                <Input
                  id="mob_estimate_gross"
                  type="tel"
                  {...form.register("estimate_gross")}
                  disabled
                  onKeyDown={handleKeyDown}
                  className="mt-1 bg-gray-100 font-semibold"
                />
              </div>
              <div>
                <Label>Tax (GST 18% = {Number(autoGst18).toFixed(0)})</Label>
                <Input
                  id="mob_estimate_tax"
                  type="tel"
                  {...form.register("estimate_tax")}
                  onChange={(e) =>
                    handleChargeChange("estimate_tax", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  maxLength={10}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_temp_amount">Net Total</Label>
                <Input
                  id="mob_estimate_temp_amount"
                  type="tel"
                  {...form.register("estimate_temp_amount")}
                  disabled
                  onKeyDown={handleKeyDown}
                  className="mt-1 bg-gray-100 font-semibold text-right"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_amount_round">Round Off</Label>
                <Input
                  id="mob_estimate_amount_round"
                  type="text"
                  {...form.register("estimate_amount_round")}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <Label className="font-semibold text-blue-900">Final Amount</Label>
                <Input
                  type="text"
                  value={Number(amountToBeCollected).toFixed(0)}
                  disabled
                  className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Mobile bottom buttons */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 hover:bg-gray-100 text-xs h-9"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSaveAction("print");
                  document.getElementById("estimate-form-mobile")?.requestSubmit();
                }}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-xs h-9 text-white"
              >
                {isSubmitting ? "Saving..." : "Save & Print"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSaveAction("exit");
                  document.getElementById("estimate-form-mobile")?.requestSubmit();
                }}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9 text-white"
              >
                {isSubmitting ? "Saving..." : "Save & Exit"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileEstimateForm;
