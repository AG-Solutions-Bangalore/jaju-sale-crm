import React, { useState } from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2, CalendarDays, Eye, RefreshCw } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ButtonConfig } from "@/config/ButtonConfig";
import { cn } from "@/lib/utils";
import ProductEditDialog from "@/module/product/components/ProductEditDialog";
import { encryptId } from "@/components/common/Encryption";

const MobileSingleItemStockReport = ({
  form,
  isLoading,
  selectedItem,
  setSelectedItem,
  itemOptions,
  searchParams,
  normalizedTxs,
  openingPieces,
  openingSqft,
  closingPieces,
  closingSqft,
  lastTxDate,
  handleDownloadCsv,
  handleDownloadPDF,
  onSubmit,
  handleEditItem,
  setShowNewItemDialog,
  tableRef,
  formatCellValue,
  formatClosingBalanceText,
  productId,
  handleChangeItemNameClick,
  isPopup = false,
}) => {
  const navigate = useNavigate();
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);

  return (
    <div className="sm:hidden space-y-4">
      {/* Title Controls */}
      {!isPopup && (
        <div className="flex flex-col gap-2 bg-gray-50 p-2 rounded-lg border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-base font-bold text-gray-800">Single Item Stock</h1>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={() => setShowNewItemDialog(true)}
                className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white p-0 flex items-center justify-center rounded"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Card */}
      {!isPopup && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="mob_itemSelect" className="text-xs font-semibold text-gray-700">
              Select Item
            </Label>
            <MemoizedSelect
              value={selectedItem}
              onChange={setSelectedItem}
              options={itemOptions}
              placeholder="Search / Select Item"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal h-8 text-xs border-gray-300 px-2",
                      !form.watch("from_date") && "text-muted-foreground"
                    )}
                  >
                    {form.watch("from_date") ? (
                      moment(form.watch("from_date")).format("DD-MM-YYYY")
                    ) : (
                      <span>Pick date</span>
                    )}
                    <CalendarDays className="h-3.5 w-3.5 opacity-75 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("from_date") ? new Date(form.watch("from_date")) : undefined}
                    onSelect={(date) =>
                      form.setValue("from_date", date ? moment(date).format("YYYY-MM-DD") : "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal h-8 text-xs border-gray-300 px-2",
                      !form.watch("to_date") && "text-muted-foreground"
                    )}
                  >
                    {form.watch("to_date") ? (
                      moment(form.watch("to_date")).format("DD-MM-YYYY")
                    ) : (
                      <span>Pick date</span>
                    )}
                    <CalendarDays className="h-3.5 w-3.5 opacity-75 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("to_date") ? new Date(form.watch("to_date")) : undefined}
                    onSelect={(date) =>
                      form.setValue("to_date", date ? moment(date).format("YYYY-MM-DD") : "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`w-full h-8 text-xs font-semibold ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Search
              </>
            )}
          </Button>
        </div>
      )}

      {/* Main Content Card */}
      {selectedItem && (
        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
          {!isPopup && (
            <div className="flex justify-between items-center flex-wrap gap-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-800">{selectedItem}</h2>
                {productId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-blue-600"
                    onClick={handleEditItem}
                    title="Edit Item Details"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {handleChangeItemNameClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeItemNameClick}
                    className="h-7 px-2 text-[10px] border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    <RefreshCw className="mr-1 h-3 w-3 text-blue-600" />
                    Change Name of Item
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsv}
                  className="h-7 px-2 text-[10px] border-gray-300"
                >
                  <FaRegFileExcel className="mr-1 h-3 w-3 text-green-600" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="h-7 px-2 text-[10px] border-gray-300"
                >
                  <FaRegFilePdf className="mr-1 h-3 w-3 text-red-600" />
                  PDF
                </Button>
                <ReactToPrint
                  trigger={() => (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px] border-gray-300"
                    >
                      <Printer className="mr-1 h-3 w-3 text-gray-600" />
                      Print
                    </Button>
                  )}
                  content={() => tableRef.current}
                  documentTitle={`Single-Item-Stock-${selectedItem}`}
                />
              </div>
            </div>
          )}

          <div ref={tableRef} className="overflow-x-auto border rounded-lg border-gray-200 bg-white">
            <div className="hidden print:block text-center p-4">
              <h2 className="text-xl font-bold">{selectedItem}</h2>
              <p className="text-xs text-gray-500 mt-1">
                Stock Transaction History (From {moment(searchParams?.from_date).format("DD MMMM YYYY")} to {moment(searchParams?.to_date).format("DD MMMM YYYY")})
              </p>
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left font-bold border-r p-1.5 text-gray-700 min-w-20">BILL NUMBER</th>
                  <th className="text-left font-bold border-r p-1.5 text-gray-700 min-w-24">CUSTOMER NAME</th>
                  <th className="text-right font-bold border-r p-1.5 text-green-800 bg-green-50/30">IN (pcs)</th>
                  <th className="text-right font-bold border-r p-1.5 text-green-800 bg-green-50/30">IN (sqft)</th>
                  <th className="text-right font-bold border-r p-1.5 text-red-800 bg-red-50/30">OUT (pcs)</th>
                  <th className="text-right font-bold border-r p-1.5 text-red-800 bg-red-50/30">OUT (sqft)</th>
                  <th className="text-right font-bold border-r p-1.5 text-blue-800 bg-blue-50/30">BAL (pcs)</th>
                  <th className="text-right font-bold p-1.5 text-blue-800 bg-blue-50/30">BAL (sqft)</th>
                </tr>
              </thead>
              <tbody>
                {normalizedTxs.length ? (
                  normalizedTxs.map((t, index) => (
                    <tr
                      key={index}
                      onClick={() => !t.isOpening && setSelectedTxDetail(t)}
                      className={cn(
                        "border-b border-gray-200 transition-colors",
                        !t.isOpening && "cursor-pointer active:bg-blue-50/80",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                    >
                      <td className="text-left p-1.5 border-r font-bold truncate max-w-[90px]">
                        {t.isOpening ? (
                          <span className="text-gray-900 font-medium">Opening Balance</span>
                        ) : (
                          <span className="text-blue-600 hover:text-blue-800 active:underline font-bold">
                            {t.jfcNumber || t.reference || "-"}
                          </span>
                        )}
                      </td>
                      <td className="text-left p-1.5 border-r text-gray-700 truncate max-w-[100px]">
                        {t.customerName || "-"}
                      </td>
                      <td className="text-right border-r p-1.5 text-green-700 font-semibold">
                        {formatCellValue(t.inward_pieces)}
                      </td>
                      <td className="text-right border-r p-1.5 text-green-700 font-semibold">
                        {formatCellValue(t.inward_sqft)}
                      </td>
                      <td className="text-right border-r p-1.5 text-red-700 font-semibold">
                        {formatCellValue(t.outward_pieces)}
                      </td>
                      <td className="text-right border-r p-1.5 text-red-700 font-semibold">
                        {formatCellValue(t.outward_sqft)}
                      </td>
                      <td className="text-right border-r p-1.5 font-bold text-gray-800">
                        {formatCellValue(t.balance_pieces)}
                      </td>
                      <td className="text-right p-1.5 font-bold text-gray-800">
                        {formatCellValue(t.balance_sqft)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No transaction history found
                    </td>
                  </tr>
                )}

                {normalizedTxs.length > 0 && (
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={2} className="text-left p-1.5">
                      Closing Balance
                    </td>
                    <td colSpan={4} className="p-1.5"></td>
                    <td className="text-right border-r p-1.5">
                      {formatCellValue(closingPieces)}
                    </td>
                    <td className="text-right p-1.5">
                      {formatCellValue(closingSqft)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simplified Product Detail Popup */}
      <Dialog open={!!selectedTxDetail} onOpenChange={(open) => !open && setSelectedTxDetail(null)}>
        <DialogContent className="w-[92vw] max-w-md bg-white rounded-lg p-4 border shadow-xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-gray-900 flex justify-between items-center pr-4">
              <span>{selectedTxDetail?.type === "purchase" ? "Purchase Product Detail" : "Sales Product Detail"}</span>
              <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono font-semibold">
                {selectedTxDetail?.type === "purchase" ? "Supplier Bill #" : "Bill #"}{selectedTxDetail?.billNumber || selectedTxDetail?.jfcNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Item Name</p>
              <p className="font-bold text-gray-800 text-xs mt-0.5">{selectedTxDetail?.itemName || selectedItem}</p>
              {selectedTxDetail?.customerName && selectedTxDetail?.customerName !== "-" && (
                <p className="text-[11px] text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">{selectedTxDetail?.type === "purchase" ? "Supplier:" : "Customer:"}</span> {selectedTxDetail?.customerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Pieces</p>
                <p className="text-xs font-bold text-slate-900">{selectedTxDetail?.pcs || 0} Pcs</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                <p className="text-[10px] text-blue-600 font-semibold mb-0.5">Square Quantity</p>
                <p className="text-xs font-bold text-blue-900">{parseFloat(selectedTxDetail?.sqft || 0).toFixed(2)} Sqft</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-md border border-emerald-200">
                <p className="text-[10px] text-emerald-600 font-semibold mb-0.5">Rate</p>
                <p className="text-xs font-bold text-emerald-900">₹ {parseFloat(selectedTxDetail?.rate || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-2 flex justify-between items-center text-xs font-bold text-gray-900">
              <span>Total Amount:</span>
              <span className="text-base text-emerald-700 font-extrabold">₹ {parseFloat(selectedTxDetail?.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileSingleItemStockReport;
