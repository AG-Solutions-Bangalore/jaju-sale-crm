import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import { useToast } from "@/hooks/use-toast";
import { useSalesById } from "../hooks/useSales";
import MobileSalesView from "../components/MobileSalesView";
import DesktopSalesView from "../components/DesktopSalesView";

const getActualRoundOff = (tempAmount, grossAmount, storedRoundOff) => {
  const temp = parseFloat(tempAmount || 0);
  const gross = parseFloat(grossAmount || 0);
  const round = parseFloat(storedRoundOff || 0);
  if (round > 0 && Math.abs(gross - (temp - round)) < 1.0) {
    return -round; // Old style: positive roundOff was subtracted
  }
  return round; // New style: signed roundOff is added
};

const SalesViewPage = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const { data: salesData, isLoading } = useSalesById(id);

  const handleDownloadPDF = () => {
    const input = tableRef.current;
    if (!input) return;

    input.classList.add("pdf-export-mode");

    const options = {
      margin: [10, 20, 10, 10],
      filename: `sales-${salesData?.sales?.sales_no}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowHeight: input.scrollHeight,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" },
    };

    html2pdf()
      .from(input)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
      })
      .save()
      .then(() => {
        input.classList.remove("pdf-export-mode");
        toast({
          title: "PDF Generated",
          description: "Sales saved as PDF",
        });
      })
      .catch((err) => {
        input.classList.remove("pdf-export-mode");
        console.error("PDF generation failed:", err);
      });
  };

  const calculateSubTotal = (items) => {
    return items?.reduce(
      (total, item) => total + (parseFloat(item.sales_sub_amount) || 0),
      0
    );
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  const sales = salesData?.data || salesData?.sales || salesData || {};
  const salesSub = sales?.subs || salesData?.salesSub || sales?.salesSub || [];
  const normalizedSalesData = { sales, salesSub };

  const subTotal = calculateSubTotal(salesSub);
  const tax = parseFloat(sales.sales_tax || 0);
  const tempo = parseFloat(sales.sales_tempo || 0);
  const labourLabel = sales.sales_labour_label || "Labour Charges";
  const labourValue = parseFloat(sales.sales_labour_value || sales.sales_loading || sales.sales_unloading || 0);
  const loading = labourValue;
  const unloading = 0;
  const other = parseFloat(sales.sales_other || 0);
  const other1 = parseFloat(sales.sales_other1 || 0);
  const gross = parseFloat(sales.sales_gross || sales.sales_amount_payable || 0);

  const unroundedTotal = subTotal + tax + tempo + labourValue + other + other1;
  const grandTotal = subTotal + tempo + labourValue + other + other1;
  const autoGst = grandTotal * 0.18;

  const roundOff = getActualRoundOff(
    sales.sales_temp_amount || sales.sales_net_total || unroundedTotal,
    gross,
    sales.sales_amount_round
  );

  const displayNetTotal = grandTotal + tax;
  const amountToBeCollected = displayNetTotal + roundOff;

  const commonProps = {
    salesData: normalizedSalesData,
    calculateSubTotal,
    subTotal,
    tax,
    tempo,
    labourLabel,
    labourValue,
    loading,
    unloading,
    other,
    other1,
    roundOff,
    grandTotal,
    autoGst,
    amountToBeCollected,
    isLoading,
    handleDownloadPDF,
    tableRef,
    navigate,
    id,
  };

  return (
    <Page>
      <MobileSalesView {...commonProps} />
      <DesktopSalesView {...commonProps} />
    </Page>
  );
};

export default SalesViewPage;
