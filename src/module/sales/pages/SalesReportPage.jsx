import React, { useState, useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ShoppingBag,
  Percent,
  Truck,
  Upload,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronLeft,
  Loader2,
  DollarSign,
  Calculator,
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
import { useSalesReport } from "../hooks/useSales";
import { ButtonConfig } from "@/config/ButtonConfig";

const SalesReportPage = () => {
  const navigate = useNavigate();

  const getToday = () => moment().format("YYYY-MM-DD");
  const getNDaysAgo = (n) => moment().subtract(n, "days").format("YYYY-MM-DD");

  const [fromDate, setFromDate] = useState(getNDaysAgo(10));
  const [toDate, setToDate] = useState(getToday());
  const [activePreset, setActivePreset] = useState("10");

  const {
    data: salesReportData,
    isLoading,
    isError,
  } = useSalesReport(fromDate, toDate);

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

  // Extract sales list from API response
  const filteredSales = useMemo(() => {
    if (!salesReportData) return [];
    const list =
      salesReportData.data?.data ||
      salesReportData.data ||
      salesReportData.sales ||
      salesReportData ||
      [];
    return Array.isArray(list) ? list : [];
  }, [salesReportData]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalSales = filteredSales.length;
    let goodsSubtotal = 0;
    let gstTotal = 0;
    let tempoCharges = 0;
    let loadingCharges = 0;
    let grossTotal = 0;
    let roundOffTotal = 0;
    let netReceivable = 0;
    let netTotalSum = 0;
    let amountCollected = 0;
    let pendingAmount = 0;

    filteredSales.forEach((sale) => {
      const getNetValue = (s) => {
        const netTotal = parseFloat(s.sales_net_total);
        if (!isNaN(netTotal) && netTotal > 0) return netTotal;
        const payable = parseFloat(s.sales_amount_payable);
        if (!isNaN(payable) && payable > 0) return payable;
        const gross = parseFloat(s.sales_gross);
        if (!isNaN(gross) && gross > 0) return gross;
        const temp = parseFloat(s.sales_temp_amount);
        if (!isNaN(temp) && temp > 0) return temp;
        const amt = parseFloat(s.sales_amount);
        if (!isNaN(amt) && amt > 0) return amt;
        return 0;
      };
      const net = getNetValue(sale);
      const tax = parseFloat(sale.sales_tax || 0);
      const tempo = parseFloat(sale.sales_tempo || 0);
      const loading = parseFloat(
        sale.sales_labour_value || sale.sales_loading || 0,
      );
      const other =
        parseFloat(sale.sales_other || 0) + parseFloat(sale.sales_other1 || 0);
      const roundOff = parseFloat(sale.sales_amount_round || 0);
      const collected = parseFloat(
        sale.sales_amount_received ||
          sale.sales_advance ||
          sale.sales_received ||
          0,
      );

      // Calculations
      const billTotal = net + roundOff;
      const itemsSubtotal =
        Array.isArray(sale.subs) && sale.subs.length > 0
          ? sale.subs.reduce(
              (sum, sub) => sum + parseFloat(sub.sales_sub_amount || 0),
              0,
            )
          : net - tax - tempo - loading - other;

      goodsSubtotal += itemsSubtotal;
      gstTotal += tax;
      tempoCharges += tempo;
      loadingCharges += loading;
      grossTotal += net - tax;
      roundOffTotal += roundOff;
      netReceivable += billTotal;
      netTotalSum += net;
      amountCollected += collected;
    });

    pendingAmount = netReceivable - amountCollected;

    return {
      totalSales,
      goodsSubtotal,
      gstTotal,
      tempoCharges,
      loadingCharges,
      grossTotal,
      roundOffTotal,
      netReceivable,
      netTotalSum,
      amountCollected,
      pendingAmount,
    };
  }, [filteredSales]);

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
                onClick={() => navigate("/sales")}
                className="rounded-full bg-white/50 hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Sales Report
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    Period analytics and totals summary
                  </span>
                  <span className="inline-flex items-center text-md font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse-subtle">
                    Total Sales: {totals.totalSales}
                  </span>
                </div>
              </div>
            </div>

            {/* Presets and Custom Ranges */}
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4">
          {/* Goods Subtotal */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-purple-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Goods Subtotal
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

          {/* Loading Charges */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-teal-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Loading Charges
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

          {/* Net Receivable */}
          <Card className="hover:shadow-md transition-all duration-200 border-none border-emerald-500 bg-white">
            <CardContent className="p-3 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Net Receivable
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
                    <TableHead className="w-[16%]">Customer</TableHead>
                    <TableHead className="w-[10%]">Mobile</TableHead>
                    <TableHead className="w-[12%]">Address</TableHead>
                    <TableHead className="text-right w-[8%]">Goods Value</TableHead>
                    <TableHead className="text-right w-[6%]">Tempo</TableHead>
                    <TableHead className="text-right w-[8%]">Labour</TableHead>
                    <TableHead className="text-right w-[6%]">Tax</TableHead>
                    <TableHead className="text-right w-[7%] font-semibold">Net Total</TableHead>
                    <TableHead className="text-right w-[6%]">Round Off</TableHead>
                    <TableHead className="text-right w-[7%] font-bold">Final Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length ? (
                    <>
                      {filteredSales.map((sale, index) => {
                        const getNetValue = (s) => {
                          const netTotal = parseFloat(s.sales_net_total);
                          if (!isNaN(netTotal) && netTotal > 0) return netTotal;
                          const payable = parseFloat(s.sales_amount_payable);
                          if (!isNaN(payable) && payable > 0) return payable;
                          const gross = parseFloat(s.sales_gross);
                          if (!isNaN(gross) && gross > 0) return gross;
                          const temp = parseFloat(s.sales_temp_amount);
                          if (!isNaN(temp) && temp > 0) return temp;
                          const amt = parseFloat(s.sales_amount);
                          if (!isNaN(amt) && amt > 0) return amt;
                          return 0;
                        };
                        const net = getNetValue(sale);
                        const tax = parseFloat(sale.sales_tax || 0);
                        const tempo = parseFloat(sale.sales_tempo || 0);
                        const loading = parseFloat(
                          sale.sales_labour_value || sale.sales_loading || 0,
                        );
                        const other =
                          parseFloat(sale.sales_other || 0) + parseFloat(sale.sales_other1 || 0);
                        const roundOff = parseFloat(sale.sales_amount_round || 0);
                        const billTotal = net + roundOff;

                        const itemsSubtotal =
                          Array.isArray(sale.subs) && sale.subs.length > 0
                            ? sale.subs.reduce(
                                (sum, sub) => sum + parseFloat(sub.sales_sub_amount || 0),
                                0,
                              )
                            : net - tax - tempo - loading - other;

                        return (
                          <TableRow key={index} className="hover:bg-gray-50/50">
                            <TableCell className="font-semibold text-gray-800">
                              {sale.sales_no}
                            </TableCell>
                            <TableCell>
                              {moment(sale.sales_date).format("DD-MMM-YYYY")}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800 truncate max-w-[120px]">
                              {sale.sales_customer}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {sale.sales_mobile || "-"}
                            </TableCell>
                            <TableCell className="text-gray-600 truncate max-w-[120px]">
                              {sale.sales_address || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {itemsSubtotal.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {tempo.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {loading.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {tax.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {net.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-gray-500">
                              {roundOff >= 0
                                ? `+${roundOff.toFixed(2)}`
                                : roundOff.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {billTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* Summary Row */}
                      <TableRow className="bg-gray-100/70 hover:bg-gray-100/70 font-bold border-t-2">
                        <TableCell colSpan={5} className="text-left font-bold text-gray-800">
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

export default SalesReportPage;
