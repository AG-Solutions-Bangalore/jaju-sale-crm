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
  DollarSign
} from "lucide-react";
import Page from "@/app/dashboard/page";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSalesList } from "../hooks/useSales";
import { ButtonConfig } from "@/config/ButtonConfig";

const SalesReportPage = () => {
  const navigate = useNavigate();
  const { data: sales = [], isLoading, isError } = useSalesList();

  const getToday = () => moment().format("YYYY-MM-DD");
  const getNDaysAgo = (n) => moment().subtract(n, "days").format("YYYY-MM-DD");

  const [fromDate, setFromDate] = useState(getNDaysAgo(10));
  const [toDate, setToDate] = useState(getToday());
  const [activePreset, setActivePreset] = useState("10");

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

  // Filter sales based on fromDate and toDate
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter((sale) => {
      const saleDate = moment(sale.sales_date);
      return (
        saleDate.isSameOrAfter(fromDate, "day") &&
        saleDate.isSameOrBefore(toDate, "day")
      );
    });
  }, [sales, fromDate, toDate]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalSales = filteredSales.length;
    let goodsSubtotal = 0;
    let gstTotal = 0;
    let tempoCharges = 0;
    let loadingCharges = 0;
    let grossTotal = 0;
    let netReceivable = 0;
    let amountCollected = 0;
    let pendingAmount = 0;

    filteredSales.forEach((sale) => {
      const net = parseFloat(sale.sales_temp_amount || 0);
      const tax = parseFloat(sale.sales_tax || 0);
      const tempo = parseFloat(sale.sales_tempo || 0);
      const loading = parseFloat(sale.sales_loading || 0);
      const unloading = parseFloat(sale.sales_unloading || 0);
      const other = parseFloat(sale.sales_other || 0) + parseFloat(sale.sales_other1 || 0);
      const roundOff = parseFloat(sale.sales_amount_round || 0);
      const collected = parseFloat(sale.sales_amount_received || sale.sales_advance || 0);

      // Calculations
      const gross = net - tax; // Gross Total = Net Total - GST
      const itemsSubtotal = gross - tempo - (loading + unloading) - other; // Goods Subtotal

      goodsSubtotal += itemsSubtotal;
      gstTotal += tax;
      tempoCharges += tempo;
      loadingCharges += loading + unloading;
      grossTotal += gross;
      netReceivable += net + roundOff;
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
      netReceivable,
      amountCollected,
      pendingAmount
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
                <h1 className="text-xl font-bold text-gray-800">Sales Report</h1>
                <p className="text-xs text-gray-500">Period analytics and totals summary</p>
              </div>
            </div>

            {/* Presets and Custom Ranges */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activePreset === "10" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("10")}
                className="text-xs"
              >
                10 Days
              </Button>
              <Button
                variant={activePreset === "15" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("15")}
                className="text-xs"
              >
                15 Days
              </Button>
              <Button
                variant={activePreset === "30" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("30")}
                className="text-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Sales */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Total Sales</p>
                <p className="text-xl font-bold text-gray-800">{totals.totalSales}</p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Goods Subtotal */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-indigo-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Goods Subtotal</p>
                <p className="text-xl font-bold text-gray-800">₹{totals.goodsSubtotal.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* GST Total */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-amber-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">GST Total</p>
                <p className="text-xl font-bold text-gray-800">₹{totals.gstTotal.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
                <Percent className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Tempo Charges */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-purple-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Tempo Charges</p>
                <p className="text-xl font-bold text-gray-800">₹{totals.tempoCharges.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                <Truck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Loading Charges */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-cyan-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Loading Charges</p>
                <p className="text-xl font-bold text-gray-800">₹{totals.loadingCharges.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-cyan-50 rounded-lg text-cyan-600">
                <Upload className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Gross Total */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Gross Total</p>
                <p className="text-xl font-bold text-gray-800">₹{totals.grossTotal.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-lg text-orange-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Net Receivable */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-emerald-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium font-bold">Net Receivable</p>
                <p className="text-xl font-extrabold text-emerald-700">₹{totals.netReceivable.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Amount Collected */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-teal-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Amount Collected</p>
                <p className="text-xl font-bold text-teal-700">₹{totals.amountCollected.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Amount */}
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-red-500 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium font-bold">Pending Amount</p>
                <p className="text-xl font-extrabold text-red-600">₹{totals.pendingAmount.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-red-50 rounded-lg text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="shadow-xs border rounded-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-800">Transactions List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Bill No</TableHead>
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right w-24 font-bold">Net Total</TableHead>
                    <TableHead className="text-right w-24">Round Off</TableHead>
                    <TableHead className="text-right w-24 font-bold">Bill Total</TableHead>
                    <TableHead className="text-right w-28 text-green-700 font-semibold">Received</TableHead>
                    <TableHead className="text-right w-28 text-red-600 font-semibold">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length ? (
                    filteredSales.map((sale, index) => {
                      const net = parseFloat(sale.sales_temp_amount || 0);
                      const roundOff = parseFloat(sale.sales_amount_round || 0);
                      const billTotal = net + roundOff;
                      const collected = parseFloat(sale.sales_amount_received || sale.sales_advance || 0);
                      const balance = billTotal - collected;

                      return (
                        <TableRow key={index} className="hover:bg-gray-50/50">
                          <TableCell className="font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/sales/view/${sale.id}`)}>
                            {sale.sales_no}
                          </TableCell>
                          <TableCell>{moment(sale.sales_date).format("DD-MMM-YYYY")}</TableCell>
                          <TableCell className="font-medium text-gray-800">{sale.sales_customer}</TableCell>
                          <TableCell className="text-right">₹{net.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-gray-500">
                            {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold">₹{billTotal.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-green-700 font-medium">₹{collected.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-red-600 font-bold">₹{balance.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
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
