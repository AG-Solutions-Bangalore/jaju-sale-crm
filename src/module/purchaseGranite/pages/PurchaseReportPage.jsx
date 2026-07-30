import React, { useState, useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Percent,
  Truck,
  Upload,
  TrendingUp,
  Calendar,
  ChevronLeft,
  Loader2,
  Calculator,
  Download,
} from "lucide-react";
import Page from "@/app/dashboard/page";
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
import { useToast } from "@/hooks/use-toast";
import { usePurchaseReport } from "../hooks/usePurchase";
import { ButtonConfig } from "@/config/ButtonConfig";

const PurchaseReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getToday = () => moment().format("YYYY-MM-DD");
  const getNDaysAgo = (n) => moment().subtract(n, "days").format("YYYY-MM-DD");

  const [fromDate, setFromDate] = useState(getNDaysAgo(10));
  const [toDate, setToDate] = useState(getToday());
  const [activePreset, setActivePreset] = useState("10");

  const { data: purchaseReportData = [], isLoading } = usePurchaseReport(fromDate, toDate);

  const handlePresetClick = (days) => {
    setActivePreset(days);
    setFromDate(getNDaysAgo(parseInt(days, 10)));
    setToDate(getToday());
  };

  const handleDateChange = (type, val) => {
    setActivePreset("custom");
    if (type === "from") {
      setFromDate(val);
    } else {
      setToDate(val);
    }
  };

  // Compute calculated metrics for each purchase record
  const computedData = useMemo(() => {
    return purchaseReportData.map((purchase) => {
      const gross = parseFloat(purchase.purchase_gross || 0);
      const net = parseFloat(
        purchase.purchase_net_total || purchase.purchase_amount || 0,
      );
      const tax = parseFloat(purchase.purchase_tax || 0);
      const tempo = parseFloat(purchase.purchase_tempo || 0);
      const loading = parseFloat(
        purchase.purchase_labour_value || purchase.purchase_loading || 0,
      );
      const other =
        parseFloat(purchase.purchase_other || 0) +
        parseFloat(purchase.purchase_other1 || 0);
      const roundOff = parseFloat(purchase.purchase_amount_round || 0);
      const finalAmount = parseFloat(purchase.purchase_amount_received || 0);
      const grossVal = net - tax;

      const goodsValue =
        Array.isArray(purchase.subs) && purchase.subs.length > 0
          ? purchase.subs.reduce(
              (sum, sub) => sum + parseFloat(sub.purchase_sub_amount || 0),
              0,
            )
          : gross || net - tax - tempo - loading - other || finalAmount;

      return {
        ...purchase,
        goodsValue: goodsValue || 0,
        tempoCharges: tempo,
        laborCharges: loading,
        grossVal,
        tax,
        roundOff,
        finalAmount,
      };
    });
  }, [purchaseReportData]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalPurchases = computedData.length;
    let goodsSubtotal = 0;
    let tempoCharges = 0;
    let loadingCharges = 0;
    let grossTotal = 0;
    let gstTotal = 0;
    let roundOffTotal = 0;
    let netReceivable = 0; // matching naming for identical UI logic
    let netTotalSum = 0;

    computedData.forEach((item) => {
      goodsSubtotal += item.goodsValue;
      tempoCharges += item.tempoCharges;
      loadingCharges += item.laborCharges;
      grossTotal += item.grossVal;
      gstTotal += item.tax;
      roundOffTotal += item.roundOff;
      netReceivable += item.finalAmount;
      netTotalSum += (item.purchase_net_total || item.purchase_amount) ? parseFloat(item.purchase_net_total || item.purchase_amount) : item.grossVal + item.tax;
    });

    return {
      totalPurchases,
      goodsSubtotal,
      tempoCharges,
      loadingCharges,
      grossTotal,
      gstTotal,
      roundOffTotal,
      netReceivable,
      netTotalSum,
    };
  }, [computedData]);

  // Export to CSV/Excel
  const handleExportCsv = () => {
    try {
      if (computedData.length === 0) {
        toast({
          title: "No Data",
          description: "There is no data to export in the selected period",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        "Sl No",
        "Bill Date",
        "Bill No.",
        "Supplier Name",
        "Supplier Mobile Number",
        "Goods Value",
        "Tempo Charges",
        "Labor Charges",
        "Gross Total",
        "Tax",
        "Net Total",
        "Round Off",
        "Final Amount",
      ];

      const rows = computedData.map((purchase, idx) => {
        const net = (purchase.purchase_net_total || purchase.purchase_amount) ? parseFloat(purchase.purchase_net_total || purchase.purchase_amount) : purchase.grossVal + purchase.tax;
        return [
          idx + 1,
          moment(purchase.purchase_date).format("DD-MMM-YYYY"),
          `"${purchase.purchase_bill_no || purchase.purchase_no || ""}"`,
          `"${purchase.purchase_supplier || ""}"`,
          `"-"`, // Mobile not in purchase schema
          purchase.goodsValue.toFixed(2),
          purchase.tempoCharges.toFixed(2),
          purchase.laborCharges.toFixed(2),
          purchase.grossVal.toFixed(2),
          purchase.tax.toFixed(2),
          net.toFixed(2),
          purchase.roundOff.toFixed(2),
          purchase.finalAmount.toFixed(2),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `purchase_report_${fromDate}_to_${toDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Successful",
        description: "Purchase report downloaded successfully as CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to download CSV",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-4 p-4 md:p-6 pb-12 max-w-7xl mx-auto">
        {/* Header Block */}
        <div
          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/purchase")}
                className="rounded-full bg-white/50 hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Purchase Report
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    Period analytics and purchase summary
                  </span>
                  <span className="inline-flex items-center text-md font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse-subtle">
                    Total Purchases: {totals.totalPurchases}
                  </span>
                </div>
              </div>
            </div>

            {/* Presets and Custom Ranges */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleExportCsv}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-xs h-8 mr-2"
              >
                <Download className="h-4 w-4" /> Export to Excel
              </Button>
              <Button
                variant={activePreset === "10" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("10")}
                className={`text-xs ${activePreset === "10" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              >
                10 Days
              </Button>
              <Button
                variant={activePreset === "15" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("15")}
                className={`text-xs ${activePreset === "15" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              >
                15 Days
              </Button>
              <Button
                variant={activePreset === "30" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("30")}
                className={`text-xs ${activePreset === "30" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              >
                30 Days
              </Button>

              <div className="flex items-center gap-1 bg-white border rounded-md px-2 py-1 shadow-sm ml-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 text-xs w-28 bg-transparent"
                />
                <span className="text-gray-400 text-xs px-1">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 text-xs w-28 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Goods Value */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-purple-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Goods Value
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.goodsSubtotal.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FileText className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Tempo Charges */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-rose-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Tempo Charges
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.tempoCharges.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <Truck className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Labor Charges */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-teal-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Labor Charges
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.loadingCharges.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Upload className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Gross Total */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-blue-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Gross Total
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.grossTotal.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Calculator className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* total tax  */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-amber-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Total Tax</p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.gstTotal.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Percent className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Net Total */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-indigo-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Net Total</p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.netTotalSum.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Calculator className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Round Off */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-slate-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Round Off</p>
                <p className="text-lg font-bold text-gray-800">
                  {totals.roundOffTotal.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                <Calculator className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Final Total */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-emerald-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Final Total
                </p>
                <p className="text-lg font-bold text-emerald-700">
                  {totals.netReceivable.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="shadow-xs border rounded-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Transactions List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[6%]">Bill No</TableHead>
                    <TableHead className="w-[10%]">Date</TableHead>
                    <TableHead className="w-[16%]">Supplier</TableHead>
                    <TableHead className="w-[10%]">Mobile</TableHead>
                    <TableHead className="text-right w-[8%]">Goods Value</TableHead>
                    <TableHead className="text-right w-[6%]">Tempo</TableHead>
                    <TableHead className="text-right w-[8%]">Labor Charges</TableHead>
                    <TableHead className="text-right w-[8%] font-semibold">Gross Total</TableHead>
                    <TableHead className="text-right w-[6%]">Tax</TableHead>
                    <TableHead className="text-right w-[7%] font-semibold">Net Total</TableHead>
                    <TableHead className="text-right w-[6%]">Round Off</TableHead>
                    <TableHead className="text-right w-[7%] font-bold">Final Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {computedData.length ? (
                    <>
                      {computedData.map((purchase, index) => {
                        const net = (purchase.purchase_net_total || purchase.purchase_amount) ? parseFloat(purchase.purchase_net_total || purchase.purchase_amount) : purchase.grossVal + purchase.tax;
                        return (
                          <TableRow key={index} className="hover:bg-gray-50/50">
                            <TableCell className="font-semibold text-gray-800">
                              {purchase.purchase_bill_no || purchase.purchase_no || "-"}
                            </TableCell>
                            <TableCell>
                              {moment(purchase.purchase_date).format("DD-MMM-YYYY")}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800 truncate max-w-[120px]">
                              {purchase.purchase_supplier || "-"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              -
                            </TableCell>
                            <TableCell className="text-right">
                              {purchase.goodsValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.tempoCharges.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.laborCharges.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {purchase.grossVal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.tax.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {net.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {purchase.roundOff >= 0
                                ? `+${purchase.roundOff.toFixed(2)}`
                                : purchase.roundOff.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {purchase.finalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* Summary Row */}
                      <TableRow className="bg-gray-100/70 hover:bg-gray-100/70 font-bold border-t-2">
                        <TableCell colSpan={4} className="text-left font-bold text-gray-800">
                          Total
                        </TableCell>
                        <TableCell className="text-right">
                          {totals.goodsSubtotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-800">
                          {totals.tempoCharges.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-800">
                          {totals.loadingCharges.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {totals.grossTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-800">
                          {totals.gstTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {totals.netTotalSum.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-800">
                          {totals.roundOffTotal >= 0
                            ? `+${totals.roundOffTotal.toFixed(2)}`
                            : totals.roundOffTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-700">
                          {totals.netReceivable.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-gray-400"
                      >
                        No transactions found in this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default PurchaseReportPage;
