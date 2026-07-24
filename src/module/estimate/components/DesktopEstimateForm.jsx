import React from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const DesktopEstimateForm = ({
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
  autoGst18 = 0,
  amountToBeCollected = 0,
  displayGrandTotal = 0,
  setSaveAction,
}) => {
  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>Add Estimate</CardTitle>
            </div>
            <div className="text-sm font-medium">
              Estimate Ref: <span className="font-bold">{estimateRef}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            id="estimate-form"
            onSubmit={handleFormSubmit}
            className="space-y-2"
          >
            {/* Customer Information */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-blue-50 p-3 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="estimate_date">
                  Date <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="estimate_date"
                  type="date"
                  {...form.register("estimate_date")}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate_customer">
                  Customer Name <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="estimate_customer"
                  {...form.register("estimate_customer")}
                  className="bg-white"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate_mobile">Mobile No</Label>
                <Input
                  id="estimate_mobile"
                  {...form.register("estimate_mobile")}
                  className="bg-white"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="space-y-2 col-span-2 lg:col-span-4">
                <Label htmlFor="estimate_address">Address</Label>
                <Input
                  id="estimate_address"
                  {...form.register("estimate_address")}
                  className="bg-white"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Items</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-sm w-[180px] min-w-[140px]">
                        Item <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-right p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Pcs/Box <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-right p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Sqft <span className="text-xs text-red-400 ">*</span>
                      </th>
                      {/* <th className="text-right p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Pcs <span className="text-xs text-red-400 ">*</span>
                      </th> */}
                      <th className="text-right p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Rate <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-right p-2 font-medium text-sm w-[110px] min-w-[90px]">
                        Amount
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemEntries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div className="flex gap-2 items-start">
                            {isCustomItem[index] ? (
                              <div className="flex-1 min-w-0 flex gap-2">
                                <Input
                                  type="text"
                                  className="h-9 uppercase placeholder:normal-case bg-white"
                                  placeholder="Enter Item Name"
                                  value={customItems[index] || ""}
                                  onChange={(e) =>
                                    handleCustomItemChange(
                                      index,
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 whitespace-nowrap shrink-0"
                                  onClick={() => handleToggleCustomItem(index)}
                                >
                                  Select
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <MemoizedProductSelect
                                    value={entry.estimate_sub_item}
                                    onChange={(value) =>
                                      handleItemChange(
                                        index,
                                        "estimate_sub_item",
                                        value,
                                      )
                                    }
                                    options={productOptions}
                                    placeholder="Select item"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 whitespace-nowrap shrink-0"
                                  onClick={() => handleToggleCustomItem(index)}
                                >
                                  <NotInListIcon className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_qnty}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_qnty",
                                e.target.value,
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="h-9 text-right"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_qnty_sqr}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_qnty_sqr",
                                e.target.value,
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="h-9 text-right"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        {/* <td className="p-2">
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
                            className="h-9 text-right"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td> */}
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_rate",
                                e.target.value,
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="h-9 text-right"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_amount}
                            disabled
                            className="h-9 bg-gray-100 text-right font-semibold"
                            placeholder="0"
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItemEntry(index)}
                            disabled={itemEntries.length <= 1}
                            className="h-9 w-9 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItemEntry}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Charges and Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spacer container to match layout */}
              <div className="border-none rounded-lg p-3 bg-white"></div>

              {/* Totals and Charges */}
              <div className="border rounded-lg p-3 bg-white space-y-2">
                {/* Tempo Charges */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label className="font-medium" htmlFor="estimate_tempo">
                      Tempo Charges
                    </Label>
                  </div>
                  <Input
                    className="w-[220px] text-right shrink-0 bg-white"
                    id="estimate_tempo"
                    type="tel"
                    {...form.register("estimate_tempo")}
                    onChange={(e) =>
                      handleChargeChange("estimate_tempo", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    maxLength={10}
                  />
                </div>

                {/* Labour Charges */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center justify-between gap-2">
                    <Label className="font-medium shrink-0 w-28">
                      Labour Charges
                    </Label>
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
                              : "estimate_unloading",
                          ) || "0",
                        );
                      }}
                    >
                      <SelectTrigger className="h-9 w-[180px] bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Loading Only">
                          Loading Only
                        </SelectItem>
                        <SelectItem value="Loading & Unloading">
                          Loading & Unloading
                        </SelectItem>
                      </SelectContent>
                    </SelectShadcn>
                  </div>
                  <Input
                    className="w-[220px] h-9 text-right shrink-0 bg-white"
                    id={
                      loadingType === "Loading Only"
                        ? "estimate_loading"
                        : "estimate_unloading"
                    }
                    type="tel"
                    value={
                      form.watch(
                        loadingType === "Loading Only"
                          ? "estimate_loading"
                          : "estimate_unloading",
                      ) || ""
                    }
                    onChange={(e) => {
                      handleChargeChange(
                        loadingType === "Loading Only"
                          ? "estimate_loading"
                          : "estimate_unloading",
                        e.target.value,
                      );
                    }}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Other 1 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0">
                    <Input
                      type="text"
                      placeholder="Other Charges 1"
                      className="w-full h-9 bg-white"
                      {...form.register("estimate_other_label")}
                    />
                  </div>
                  <Input
                    className="w-[220px] h-9 text-right shrink-0 bg-white"
                    id="estimate_other"
                    type="tel"
                    {...form.register("estimate_other")}
                    onChange={(e) =>
                      handleChargeChange("estimate_other", e.target.value)
                    }
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Other 2 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0">
                    <Input
                      type="text"
                      placeholder="Other Charges 2"
                      className="w-full h-9 bg-white"
                      {...form.register("estimate_other1_label")}
                    />
                  </div>
                  <Input
                    className="w-[220px] h-9 text-right shrink-0 bg-white"
                    id="estimate_other1"
                    type="tel"
                    {...form.register("estimate_other1")}
                    onChange={(e) =>
                      handleChargeChange("estimate_other1", e.target.value)
                    }
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Gross Total */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label htmlFor="estimate_gross" className="font-medium">
                      Gross Total
                    </Label>
                  </div>
                  <Input
                    className="w-[220px] text-right font-medium shrink-0 bg-gray-100 font-semibold"
                    id="estimate_gross"
                    type="tel"
                    {...form.register("estimate_gross")}
                    disabled
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label className="font-medium">
                      Tax{" "}
                      <span className="font-medium text-xs text-gray-500">
                        (GST 18% = {Number(autoGst18).toFixed(0)})
                      </span>
                    </Label>
                  </div>
                  <Input
                    className="w-[220px] text-right shrink-0 bg-white"
                    id="estimate_tax"
                    type="tel"
                    {...form.register("estimate_tax")}
                    onChange={(e) =>
                      handleChargeChange("estimate_tax", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    maxLength={10}
                  />
                </div>

                {/* Net Total */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label
                      htmlFor="estimate_temp_amount"
                      className="font-medium"
                    >
                      Net Total
                    </Label>
                  </div>
                  <Input
                    className="w-[220px] text-right font-medium shrink-0 bg-gray-100 font-semibold"
                    id="estimate_temp_amount"
                    type="tel"
                    {...form.register("estimate_temp_amount")}
                    disabled
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Round Off */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label className="font-medium">Round Off</Label>
                  </div>
                  <Input
                    className="w-[220px] text-right font-medium bg-white border border-gray-200 shrink-0"
                    id="estimate_amount_round"
                    type="text"
                    {...form.register("estimate_amount_round")}
                    onChange={(e) =>
                      handleChargeChange(
                        "estimate_amount_round",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                  />
                </div>

                {/* Final Amount */}
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[305px] shrink-0 flex items-center">
                    <Label className="font-semibold text-blue-900">
                      Final Amount
                    </Label>
                  </div>
                  <Input
                    className="w-[220px] bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md shrink-0"
                    type="text"
                    value={Number(amountToBeCollected).toFixed(0)}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setSaveAction("print");
                  document.getElementById("estimate-form")?.requestSubmit();
                }}
                className="border-gray-300 bg-green-600 hover:bg-green-700 text-white hover:text-white disabled:bg-gray-400"
              >
                {isSubmitting ? "Saving..." : "Save & Print"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setSaveAction("exit");
                  document.getElementById("estimate-form")?.requestSubmit();
                }}
                className="border-gray-300 bg-blue-600 hover:bg-blue-700 text-white hover:text-white disabled:bg-gray-400"
              >
                {isSubmitting ? "Saving..." : "Save & Exit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopEstimateForm;
