import React, { useState } from "react";
import moment from "moment";
import {
  Printer,
  Search,
  Plus,
  Pencil,
  Loader2,
  CalendarDays,
  Eye,
  RefreshCw,
} from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ButtonConfig } from "@/config/ButtonConfig";
import { cn } from "@/lib/utils";
import ProductEditDialog from "@/module/product/components/ProductEditDialog";
import { encryptId } from "@/components/common/Encryption";

const DesktopSingleItemStockReport = ({
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
    <div className="hidden sm:block space-y-4">
      {/* Title and Top Controls */}
      {!isPopup && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Single Item Stock
            </h1>
            <p className="text-xs text-gray-500">
              View detailed stock transaction history by item
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
          </div>
        </div>
      )}

      {/* Filter Card */}
      {!isPopup && (
        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Select Item */}
                <div className="space-y-1.5 md:col-span-1">
                  <Label
                    htmlFor="itemSelect"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Select Item
                  </Label>
                  <MemoizedSelect
                    value={selectedItem}
                    onChange={setSelectedItem}
                    options={itemOptions}
                    placeholder="Search / Select Item"
                  />
                </div>

                {/* From Date */}
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    From Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                          !form.watch("from_date") && "text-muted-foreground",
                        )}
                      >
                        {form.watch("from_date") ? (
                          moment(form.watch("from_date")).format("DD-MM-YYYY")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          form.watch("from_date")
                            ? new Date(form.watch("from_date"))
                            : undefined
                        }
                        onSelect={(date) =>
                          form.setValue(
                            "from_date",
                            date ? moment(date).format("YYYY-MM-DD") : "",
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    To Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-left font-normal h-9 text-xs border-gray-300",
                          !form.watch("to_date") && "text-muted-foreground",
                        )}
                      >
                        {form.watch("to_date") ? (
                          moment(form.watch("to_date")).format("DD-MM-YYYY")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarDays className="h-4 w-4 opacity-75 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          form.watch("to_date")
                            ? new Date(form.watch("to_date"))
                            : undefined
                        }
                        onSelect={(date) =>
                          form.setValue(
                            "to_date",
                            date ? moment(date).format("YYYY-MM-DD") : "",
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:col-span-1">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`h-9 px-4 text-xs font-semibold flex-1 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
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
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Content Card */}
      {selectedItem && (
        <Card className="shadow-xs border-gray-200">
          {!isPopup && (
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between flex-wrap gap-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span>{selectedItem}</span>
                  {/* Edit Icon Button */}
                  {productId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={handleEditItem}
                      title="Edit Item Details"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardTitle>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {handleChangeItemNameClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeItemNameClick}
                    className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                    Change Name of Item
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsv}
                  className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
                >
                  <FaRegFileExcel className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
                >
                  <FaRegFilePdf className="mr-1.5 h-3.5 w-3.5 text-red-600" />
                  PDF
                </Button>
                <ReactToPrint
                  trigger={() => (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex-1 sm:flex-none border-gray-300"
                    >
                      <Printer className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                      Print
                    </Button>
                  )}
                  content={() => tableRef.current}
                  documentTitle={`Single-Item-Stock-${selectedItem}`}
                />
              </div>
            </CardHeader>
          )}

          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Transaction History Table */}
                <div
                  ref={tableRef}
                  className="overflow-x-scroll thick-scrollbar border rounded-lg border-gray-200"
                >
                  <Table className="border-collapse w-full text-[11px]">
                    <TableHeader className="bg-gray-100 text-gray-900 sticky top-0">
                      <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead
                          rowSpan={2}
                          className="text-center text-gray-800 font-bold border-r border-gray-200 align-middle w-28"
                        >
                          DATE
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-left text-gray-800 font-bold border-r border-gray-200 align-middle pl-3 min-w-32"
                        >
                          BILL NUMBER
                        </TableHead>
                        <TableHead
                          rowSpan={2}
                          className="text-left text-gray-800 font-bold border-r border-gray-200 align-middle pl-3 min-w-40"
                        >
                          CUSTOMER NAME
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center text-green-800 font-bold border-r border-gray-200 bg-green-50/50 py-1.5"
                        >
                          INWARD
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center text-red-800 font-bold border-r border-gray-200 bg-red-50/50 py-1.5"
                        >
                          OUTWARD
                        </TableHead>
                        <TableHead
                          colSpan={2}
                          className="text-center text-blue-800 font-bold bg-blue-50/50 py-1.5 border-r border-gray-200"
                        >
                          BALANCE
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">
                          Pcs / Box
                        </TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">
                          SQFT
                        </TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">
                          Pcs / Box
                        </TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 py-1 w-20 text-gray-700">
                          SQFT
                        </TableHead>
                        <TableHead className="text-right pr-6 font-bold border-r border-gray-200 bg-blue-50/20 py-1 w-20 text-gray-700">
                          Pcs / Box
                        </TableHead>
                        <TableHead className="text-right pr-6 bg-blue-50/20 py-1 w-20 text-gray-700">
                          SQFT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {normalizedTxs.length ? (
                        normalizedTxs.map((t, index) => (
                          <TableRow
                            key={index}
                            onClick={() => !t.isOpening && setSelectedTxDetail(t)}
                            className={cn(
                              "border-b border-gray-200 transition-colors",
                              !t.isOpening && "cursor-pointer hover:bg-blue-50/60",
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                            )}
                          >
                            <TableCell className="text-center border-r border-gray-200 font-medium py-2">
                              {t.date
                                ? moment(t.date).format("DD MMMM YYYY")
                                : ""}
                            </TableCell>
                            <TableCell className="text-left pl-3 border-r border-gray-200 font-bold py-2">
                              {t.isOpening ? (
                                <span className="text-gray-900 font-medium">Opening Balance</span>
                              ) : (
                                <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-bold inline-flex items-center gap-1">
                                  {t.jfcNumber || t.reference || "-"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-left pl-3 border-r border-gray-200 font-medium text-gray-700 py-2">
                              {t.customerName || "-"}
                            </TableCell>

                            {/* INWARD */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-green-700 font-semibold py-2">
                              {formatCellValue(t.inward_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-green-700 font-semibold py-2">
                              {formatCellValue(t.inward_sqft)}
                            </TableCell>

                            {/* OUTWARD */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-red-700 font-semibold py-2">
                              {formatCellValue(t.outward_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 border-r border-gray-200 text-red-700 font-semibold py-2">
                              {formatCellValue(t.outward_sqft)}
                            </TableCell>

                            {/* BALANCE */}
                            <TableCell className="text-right pr-6 border-r border-gray-200 bg-blue-50/20 text-gray-800 font-bold py-2">
                              {formatCellValue(t.balance_pieces)}
                            </TableCell>
                            <TableCell className="text-right pr-6 bg-blue-50/20 text-gray-800 font-bold py-2 border-r border-gray-200">
                              {formatCellValue(t.balance_sqft)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td
                            colSpan={9}
                            className="text-center py-12 text-gray-500 font-medium"
                          >
                            No transaction history found for the selected
                            criteria
                          </td>
                        </TableRow>
                      )}

                      {/* Final Closing Balance Row */}
                      {normalizedTxs.length > 0 && (
                        <TableRow className="bg-slate-900 text-white hover:bg-slate-900 font-bold text-xs">
                          <TableCell colSpan={3} className="text-left pl-3 py-2.5 whitespace-nowrap">
                            Closing:{" "}
                            {formatClosingBalanceText(
                              closingPieces,
                              closingSqft,
                            )}
                          </TableCell>
                          <TableCell colSpan={4} className="py-2.5"></TableCell>
                          <TableCell className="text-right pr-6 border-r border-slate-800 py-2.5">
                            {formatCellValue(closingPieces)}
                          </TableCell>
                          <TableCell className="text-right pr-6 py-2.5">
                            {formatCellValue(closingSqft)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Simplified Product Detail Popup */}
      <Dialog open={!!selectedTxDetail} onOpenChange={(open) => !open && setSelectedTxDetail(null)}>
        <DialogContent className="max-w-md bg-white rounded-lg p-6 border shadow-xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold text-gray-900 flex justify-between items-center pr-4">
              <span>{selectedTxDetail?.type === "purchase" ? "Purchase Product Detail" : "Sales Product Detail"}</span>
              <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono font-semibold">
                {selectedTxDetail?.type === "purchase" ? "Supplier Bill #" : "Bill #"}{selectedTxDetail?.billNumber || selectedTxDetail?.jfcNumber}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Item Name</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedTxDetail?.itemName || selectedItem}</p>
              {selectedTxDetail?.customerName && selectedTxDetail?.customerName !== "-" && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">{selectedTxDetail?.type === "purchase" ? "Supplier:" : "Customer:"}</span> {selectedTxDetail?.customerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-1">Pieces</p>
                <p className="text-base font-bold text-slate-900">{selectedTxDetail?.pcs || 0} Pcs</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">Square Quantity</p>
                <p className="text-base font-bold text-blue-900">{parseFloat(selectedTxDetail?.sqft || 0).toFixed(2)} Sqft</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Rate</p>
                <p className="text-base font-bold text-emerald-900">₹ {parseFloat(selectedTxDetail?.rate || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Amount:</span>
              <span className="text-lg text-emerald-700 font-extrabold">₹ {parseFloat(selectedTxDetail?.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesktopSingleItemStockReport;
