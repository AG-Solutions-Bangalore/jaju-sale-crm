import React, { useState, useMemo, useRef } from "react";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { useStocksReportByItem } from "../hooks/useStocks";
import { getTodayDate } from "@/utils/currentDate";
import DesktopSingleItemStockReport from "./DesktopSingleItemStockReport";
import MobileSingleItemStockReport from "./MobileSingleItemStockReport";

import { useForm } from "react-hook-form";

const SingleItemStockReportDialog = ({ itemName, trigger }) => {
  const [open, setOpen] = useState(false);
  const tableRef = useRef(null);

  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState(getTodayDate());

  const form = useForm({
    defaultValues: {
      from_date: fromDate,
      to_date: toDate,
    },
  });

  // Fetch report data only when open
  const searchParams = useMemo(() => {
    if (!open) return null;
    return {
      item_name: itemName,
      from_date: fromDate,
      to_date: toDate,
    };
  }, [open, itemName, fromDate, toDate]);

  const { data: stocksData, isLoading } = useStocksReportByItem(searchParams);

  // Memoized balance calculation matching SingleItemStockReportPage.jsx
  const {
    normalizedTxs,
    openingPieces,
    openingSqft,
    closingPieces,
    closingSqft,
    lastTxDate,
  } = useMemo(() => {
    if (!stocksData) {
      return {
        normalizedTxs: [],
        openingPieces: 0,
        openingSqft: 0,
        closingPieces: 0,
        closingSqft: 0,
        lastTxDate: "",
      };
    }
    const stockItem = stocksData?.stocks?.[0] || {};

    const opPieces = Number(stockItem.openpurch_pcs || 0) - Number(stockItem.closesale_pcs || 0);
    const opSqft = Number(stockItem.openpurch_sqr || 0) - Number(stockItem.closesale_sqr || 0);

    const clPieces = opPieces + Number(stockItem.purch_pcs || 0) - Number(stockItem.sale_pcs || 0);
    const clSqft = opSqft + Number(stockItem.purch_sqr || 0) - Number(stockItem.sale_sqr || 0);

    const purchaseList = Array.isArray(stocksData?.purchase) ? stocksData.purchase : [];
    const saleList = Array.isArray(stocksData?.sale) ? stocksData.sale : [];

    const combined = [
      ...purchaseList.map((p) => ({
        ...p,
        type: "purchase",
        date: p.purchase_sub_date || "",
      })),
      ...saleList.map((s) => ({
        ...s,
        type: "sale",
        date: s.sales_sub_date || "",
      })),
    ];

    combined.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningPieces = opPieces;
    let runningSqft = opSqft;

    const normalized = combined.map((t) => {
      if (t.type === "purchase") {
        const inward_pcs = Number(t.purchase_sub_pcs || 0);
        const inward_sqft = Number(t.purchase_sub_qnty_sqr || 0);
        const rate = Number(t.purchase_sub_rate || 0);
        const amount = Number(t.purchase_sub_amount || (inward_sqft * rate) || 0);

        runningPieces += inward_pcs;
        runningSqft += inward_sqft;

        const parent = t.purchase || {};
        const supplierBillNo = parent.purchase_bill_no || t.purchase_bill_no || parent.purchase_no || t.purchase_no || t.purchase_ref || parent.purchase_ref || "-";
        const supplierName = parent.purchase_supplier || t.purchase_supplier || t.supplier_name || "-";

        return {
          type: "purchase",
          date: t.purchase_sub_date,
          reference: t.purchase_ref || parent.purchase_ref || "",
          jfcNumber: supplierBillNo,
          billNumber: supplierBillNo,
          customerName: supplierName,
          itemName: t.purchase_sub_item || stockItem.stock_item || "",
          pcs: inward_pcs,
          sqft: inward_sqft,
          rate,
          amount,
          inward_pieces: inward_pcs,
          inward_sqft: inward_sqft,
          outward_pieces: null,
          outward_sqft: null,
          balance_pieces: runningPieces,
          balance_sqft: runningSqft,
          raw: t,
        };
      } else {
        const outward_pcs = Number(t.sales_sub_pcs || 0);
        const outward_sqft = Number(t.sales_sub_qnty_sqr || 0);
        const rate = Number(t.sales_sub_rate || 0);
        const amount = Number(t.sales_sub_amount || (outward_sqft * rate) || 0);

        runningPieces -= outward_pcs;
        runningSqft -= outward_sqft;

        const parent = t.sale || {};
        const jfcNo = parent.sales_no || t.sales_no || t.sales_ref || parent.sales_ref || "-";
        const custName = parent.sales_customer || t.sales_customer || t.customer_name || "-";

        return {
          type: "sale",
          date: t.sales_sub_date,
          reference: t.sales_ref || parent.sales_ref || "",
          jfcNumber: jfcNo,
          billNumber: jfcNo,
          customerName: custName,
          itemName: t.sales_sub_item || stockItem.stock_item || "",
          pcs: outward_pcs,
          sqft: outward_sqft,
          rate,
          amount,
          inward_pieces: null,
          inward_sqft: null,
          outward_pieces: outward_pcs,
          outward_sqft: outward_sqft,
          balance_pieces: runningPieces,
          balance_sqft: runningSqft,
          raw: t,
        };
      }
    });

    if (searchParams) {
      normalized.unshift({
        date: searchParams.from_date || "",
        reference: "Opening Balance",
        jfcNumber: "-",
        customerName: "-",
        isOpening: true,
        inward_pieces: null,
        inward_sqft: null,
        outward_pieces: null,
        outward_sqft: null,
        balance_pieces: opPieces,
        balance_sqft: opSqft,
      });
    }

    const lastTx = combined[combined.length - 1];
    const lastDateText = lastTx ? moment(lastTx.date).format("DD-MMM-YYYY") : "";

    return {
      normalizedTxs: normalized,
      openingPieces: opPieces,
      openingSqft: opSqft,
      closingPieces: clPieces,
      closingSqft: clSqft,
      lastTxDate: lastDateText,
    };
  }, [stocksData, searchParams]);

  const handleDownloadCsv = () => {
    try {
      if (normalizedTxs.length === 0) return;
      const headers = [
        "Date",
        "Reference",
        "Inward Pcs",
        "Inward Sqft",
        "Outward Pcs",
        "Outward Sqft",
        "Balance Pcs",
        "Balance Sqft",
      ];
      const rows = normalizedTxs.map((t) => [
        t.date ? moment(t.date).format("DD-MMM-YYYY") : "",
        `"${t.reference || ""}"`,
        t.inward_pieces ?? "",
        t.inward_sqft ?? "",
        t.outward_pieces ?? "",
        t.outward_sqft ?? "",
        t.balance_pieces ?? "",
        t.balance_sqft ?? "",
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `stock_report_${itemName.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPDF = () => {
    // Basic print preview trigger or message as PDF generation requires DOM element rendering
    window.print();
  };

  const formatCellValue = (value) => {
    if (value === undefined || value === null || value === "") return "";
    const num = parseFloat(value);
    return isNaN(num) ? value : Number(num.toFixed(2));
  };

  const formatClosingBalanceText = () => {
    const pcsVal = Number(parseFloat(closingPieces || 0).toFixed(2));
    const sqftVal = Number(parseFloat(closingSqft || 0).toFixed(2));
    return `${pcsVal} Pcs/Box , ${sqftVal} Sqft`;
  };

  const commonProps = {
    form,
    isLoading,
    selectedItem: itemName,
    setSelectedItem: () => {},
    itemOptions: [{ value: itemName, label: itemName }],
    searchParams: { from_date: fromDate, to_date: toDate },
    normalizedTxs,
    openingPieces,
    openingSqft,
    closingPieces,
    closingSqft,
    lastTxDate,
    handleDownloadCsv,
    handleDownloadPDF,
    onSubmit: (data) => {
      setFromDate(data.from_date);
      setToDate(data.to_date);
    },
    handleEditItem: () => {},
    setShowNewItemDialog: () => {},
    tableRef,
    formatCellValue,
    formatClosingBalanceText,
    productId: null,
    isPopup: true,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-800">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-bold text-gray-800">
            Stock History: <span className="text-blue-600 font-bold">{itemName}</span>
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading item stock report...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden sm:block">
              <DesktopSingleItemStockReport {...commonProps} />
            </div>
            <div className="block sm:hidden">
              <MobileSingleItemStockReport {...commonProps} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SingleItemStockReportDialog;
