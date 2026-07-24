import React, { useState, useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Loader2,
  Download,
  ChevronLeft,
} from "lucide-react";
import Page from "@/app/dashboard/page";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const SalesReportPurchaseListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getToday = () => moment().format("YYYY-MM-DD");
  const getNDaysAgo = (n) => moment().subtract(n, "days").format("YYYY-MM-DD");

  const [fromDate, setFromDate] = useState(getNDaysAgo(10));
  const [toDate, setToDate] = useState(getToday());
  const [activePreset, setActivePreset] = useState("10");

  const { data: purchaseData = [], isLoading } = usePurchaseReport(
    fromDate,
    toDate,
  );

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

  // Compute calculated metrics
  const computedData = useMemo(() => {
    return purchaseData.map((purchase) => {
      const finalAmount = parseFloat(purchase.purchase_amount_received || 0);

      // Detail fields only available if API returns them
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
        tax,
        roundOff,
        finalAmount,
      };
    });
  }, [purchaseData]);

  // Calculate totals
  const totals = useMemo(() => {
    let goodsTotal = 0;
    let tempoTotal = 0;
    let laborTotal = 0;
    let taxTotal = 0;
    let roundOffTotal = 0;
    let amountTotal = 0;

    computedData.forEach((item) => {
      goodsTotal += item.goodsValue;
      tempoTotal += item.tempoCharges;
      laborTotal += item.laborCharges;
      taxTotal += item.tax;
      roundOffTotal += item.roundOff;
      amountTotal += item.finalAmount;
    });

    return {
      count: computedData.length,
      goodsTotal,
      tempoTotal,
      laborTotal,
      taxTotal,
      roundOffTotal,
      amountTotal,
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
        "Purchase Date",
        "JFC Bill No.",
        "Supplier Name",
        "Goods Value",
        "Tempo Charges",
        "Labour Charges",
        "Tax",
        "Round Off",
        "Final Amount",
      ];

      const rows = computedData.map((purchase, idx) => [
        idx + 1,
        moment(purchase.purchase_date).format("DD-MMM-YYYY"),
        `"${purchase.purchase_bill_no || purchase.purchase_no || purchase.purchase_ref || ""}"`,
        `"${purchase.purchase_supplier || ""}"`,
        purchase.goodsValue.toFixed(0),
        purchase.tempoCharges.toFixed(0),
        purchase.laborCharges.toFixed(0),
        purchase.tax.toFixed(0),
        purchase.roundOff.toFixed(0),
        purchase.finalAmount.toFixed(0),
      ]);

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
        `purchase_report_list_${fromDate}_to_${toDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Successful",
        description: "Purchase list report downloaded successfully as CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to download CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <Page>
      <div className="space-y-4 p-4 md:p-6 pb-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 bg-white/40 backdrop-blur-md rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 bg-white hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Purchase Report List
              </h1>
              <p className="text-xs text-gray-500">
                View detailed purchase records and export to Excel/CSV
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportCsv}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-xs"
          >
            <Download className="h-4 w-4" /> Export to Excel
          </Button>
        </div>

        {/* Filters and Date Pickers */}
        <div className="bg-white border rounded-lg p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Filter by Period
              </span>
              <div className="flex flex-wrap items-center gap-2">
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

            {/* Quick Summary Cards */}
            <div className="flex gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 min-w-[120px]">
                <span className="text-[10px] text-blue-600 font-semibold block uppercase">
                  Total Bills
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {totals.count}
                </span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 min-w-[150px]">
                <span className="text-[10px] text-emerald-600 font-semibold block uppercase">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-emerald-900">
                  {totals.amountTotal.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Table */}
        <Card className="shadow-xs border rounded-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Purchase Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sl No</TableHead>
                      <TableHead className="w-28">Date</TableHead>
                      {/* <TableHead className="w-28">JFC Bill No.</TableHead> */}
                      <TableHead>Supplier Name</TableHead>
                      <TableHead className="text-right w-28 font-bold text-blue-900">
                        Goods Value
                      </TableHead>
                      <TableHead className="text-right w-28">Tempo</TableHead>
                      <TableHead className="text-right w-28">
                        Labour
                      </TableHead>
                      <TableHead className="text-right w-24">Tax</TableHead>
                      <TableHead className="text-right w-24">
                        Round Off
                      </TableHead>
                      <TableHead className="text-right w-32 font-bold text-emerald-700">
                        Final Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computedData.length ? (
                      <>
                        {computedData.map((purchase, index) => (
                          <TableRow key={index} className="hover:bg-gray-50/50">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {moment(purchase.purchase_date).format(
                                "DD-MMM-YYYY",
                              )}
                            </TableCell>
                            {/* <TableCell className="font-semibold text-gray-800">
                              {purchase.purchase_bill_no || purchase.purchase_no || purchase.purchase_ref}
                            </TableCell> */}
                            <TableCell className="font-medium text-gray-800">
                              {purchase.purchase_supplier || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {purchase.goodsValue.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.tempoCharges.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.laborCharges.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {purchase.tax.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {purchase.roundOff >= 0
                                ? `+${purchase.roundOff.toFixed(0)}`
                                : purchase.roundOff.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-700">
                              {purchase.finalAmount.toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Summary Row */}
                        <TableRow className="bg-gray-100/70 hover:bg-gray-100/70 font-bold border-t-2">
                          <TableCell
                            colSpan={3}
                            className="text-left font-bold text-gray-800"
                          >
                            Total
                          </TableCell>
                          <TableCell className="text-right text-blue-900 font-bold">
                            {totals.goodsTotal.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-right text-gray-800">
                            {totals.tempoTotal.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-right text-gray-800">
                            {totals.laborTotal.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-right text-gray-800">
                            {totals.taxTotal.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-right text-gray-800">
                            {totals.roundOffTotal >= 0
                              ? `+${totals.roundOffTotal.toFixed(0)}`
                              : totals.roundOffTotal.toFixed(0)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-800 font-bold">
                            {totals.amountTotal.toFixed(0)}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-10 text-gray-400"
                        >
                          No transactions found in this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default SalesReportPurchaseListPage;
