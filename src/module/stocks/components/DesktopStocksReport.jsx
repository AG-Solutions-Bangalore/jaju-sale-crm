import React from "react";
import moment from "moment";
import { Printer, Search, Plus, Pencil, Loader2 } from "lucide-react";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";
import ProductEditDialog from "@/module/product/components/ProductEditDialog";
import SingleItemStockReportDialog from "./SingleItemStockReportDialog";

const DesktopStocksReport = ({
  form,
  isLoading,
  stocksData,
  searchParams,
  selectedUnits,
  handleUnitToggle,
  handleDownloadCsv,
  handleDownloadPDF,
  onSubmit,
  handleEditItem,
  setShowNewItemDialog,
  tableRef,
  formatStockValue,
  productTypes = [],
}) => {
  const navigate = useNavigate();
  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <div
          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Title Section */}
            <div className="w-[30%] shrink-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                Stocks Report
              </h1>
            </div>

            {/* Form Section */}
            <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full"
                >
                  {/* From Date */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="from_date"
                      className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                    >
                      From Date
                    </Label>
                    <Input
                      id="from_date"
                      type="date"
                      {...form.register("from_date")}
                      className="h-8 text-xs"
                    />
                    {form.formState.errors.from_date && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.from_date.message}
                      </p>
                    )}
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="to_date"
                      className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
                    >
                      To Date
                    </Label>
                    <Input
                      id="to_date"
                      type="date"
                      {...form.register("to_date")}
                      className="h-8 text-xs"
                    />
                    {form.formState.errors.to_date && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.to_date.message}
                      </p>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`h-8 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {searchParams && (
          <>
            <CardHeader className="border-t">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                <CardTitle className="text-lg flex flex-row items-center gap-2">
                </CardTitle>
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewItemDialog(true)}
                    className="bg-green-50 hover:bg-green-100 border-green-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Item
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCsv}
                  >
                    <FaRegFileExcel className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <FaRegFilePdf className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                    )}
                    content={() => tableRef.current}
                    documentTitle="Stock-Report"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div ref={tableRef} className="overflow-x-auto print:p-4">
                <div className="relative text-center mb-6">
                  <div className="font-semibold text-lg">Stocks Report</div>
                  <div className="text-sm text-gray-500 mt-1">
                    From{" "}
                    {moment(searchParams.from_date).format("DD-MMM-YYYY")}{" "}
                    to {moment(searchParams.to_date).format("DD-MMM-YYYY")}
                  </div>
                  <div
                    data-html2canvas-ignore="true"
                    className="absolute right-0 top-1/2 -translate-y-1/2 print:hidden flex items-center gap-4"
                  >
                    <Label className="text-xs font-medium">
                      Show Units:
                    </Label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUnits.box}
                          onChange={() => handleUnitToggle("box")}
                        />
                        Box/Piece
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUnits.sqft}
                          onChange={() => handleUnitToggle("sqft")}
                        />
                        Sqft
                      </label>
                    </div>
                  </div>
                </div>
                <Table className="border table-fixed w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-center text-black font-bold border-r w-[36%]">
                        Items Name
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r w-[16%]">
                        Opening Balance
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r w-[16%]">
                        Purchases
                      </TableHead>
                      <TableHead className="text-center text-black font-bold border-r w-[16%]">
                        Sales
                      </TableHead>
                      <TableHead className="text-center text-black font-bold w-[16%]">
                        Closing Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const displayVal = (val, unit) => {
                        const formatted = formatStockValue(val);
                        if (formatted === "-") return <span className="text-gray-400">-</span>;
                        return (
                          <span>
                            <span className="text-gray-900 font-semibold">{formatted}</span>{" "}
                            <span className="text-gray-400 font-normal text-[10px]">{unit}</span>
                          </span>
                        );
                      };

                      if (isLoading) {
                        return (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading stock data...
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      const rawList = stocksData?.stocks || stocksData?.data || (Array.isArray(stocksData) ? stocksData : []);
                      const filteredStocks = rawList.filter((item) => {
                        const openPcs = parseFloat(item.openpurch_pcs || 0);
                        const closePcs = parseFloat(item.closesale_pcs || 0);
                        const purchPcs = parseFloat(item.purch_pcs || 0);
                        const salePcs = parseFloat(item.sale_pcs || 0);

                        const openSqr = parseFloat(item.openpurch_sqr || 0);
                        const closeSqr = parseFloat(item.closesale_sqr || 0);
                        const purchSqr = parseFloat(item.purch_sqr || 0);
                        const saleSqr = parseFloat(item.sale_sqr || 0);

                        const closingPcs = openPcs - closePcs + (purchPcs - salePcs);
                        const closingSqr = openSqr - closeSqr + (purchSqr - saleSqr);

                        return (
                          purchPcs !== 0 ||
                          salePcs !== 0 ||
                          purchSqr !== 0 ||
                          saleSqr !== 0 ||
                          openPcs !== 0 ||
                          closePcs !== 0 ||
                          openSqr !== 0 ||
                          closeSqr !== 0 ||
                          closingPcs !== 0 ||
                          closingSqr !== 0
                        );
                      });

                      if (!filteredStocks.length) {
                        return (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="space-y-2">
                                <div className="text-lg">📋</div>
                                <div>
                                  No stock data found for the selected criteria
                                </div>
                                <div className="text-sm text-gray-400">
                                  Try adjusting your date range
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return filteredStocks.map((item, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }
                        >
                          <TableCell className="text-left border-r py-2">
                            <div className="flex items-center justify-between w-full gap-2">
                              {(() => {
                                const matchedProduct = productTypes?.find(
                                  (p) =>
                                    (p.product_type || p.item_name || "").toLowerCase() ===
                                    item.item_name?.toLowerCase()
                                );

                                const itemNameBtn = (
                                  <SingleItemStockReportDialog
                                    itemName={item.item_name}
                                    trigger={
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-left font-semibold truncate"
                                      >
                                        {item.item_name}
                                      </button>
                                    }
                                  />
                                );

                                return (
                                  <>
                                    {itemNameBtn}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <SingleItemStockReportDialog itemName={item.item_name} />
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {selectedUnits.box &&
                              displayVal(item.openpurch_pcs - item.closesale_pcs, "Pcs/Box")}
                            {selectedUnits.box &&
                              selectedUnits.sqft &&
                              <span className="text-gray-300"> , </span>}
                            {selectedUnits.sqft &&
                              displayVal(item.openpurch_sqr - item.closesale_sqr, "Sqft")}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {selectedUnits.box &&
                              displayVal(item.purch_pcs, "Pcs/Box")}
                            {selectedUnits.box &&
                              selectedUnits.sqft &&
                              <span className="text-gray-300"> , </span>}
                            {selectedUnits.sqft &&
                              displayVal(item.purch_sqr, "Sqft")}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {selectedUnits.box &&
                              displayVal(item.sale_pcs, "Pcs/Box")}
                            {selectedUnits.box &&
                              selectedUnits.sqft &&
                              <span className="text-gray-300"> , </span>}
                            {selectedUnits.sqft &&
                              displayVal(item.sale_sqr, "Sqft")}
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedUnits.box &&
                              displayVal(item.openpurch_pcs - item.closesale_pcs + (item.purch_pcs - item.sale_pcs), "Pcs/Box")}
                            {selectedUnits.box &&
                              selectedUnits.sqft &&
                              <span className="text-gray-300"> , </span>}
                            {selectedUnits.sqft &&
                              displayVal(item.openpurch_sqr - item.closesale_sqr + (item.purch_sqr - item.sale_sqr), "Sqft")}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default DesktopStocksReport;
