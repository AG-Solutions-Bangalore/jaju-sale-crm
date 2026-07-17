import React from "react";
import { ChevronLeft, Edit, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommonPrintTemplate from "@/components/common/CommonPrintTemplate";

const DesktopSalesView = ({
  salesData,
  calculateSubTotal,
  subTotal,
  tax,
  tempo,
  loading,
  unloading,
  other,
  other1,
  roundOff,
  grandTotal,
  autoGst,
  amountToBeCollected,
  handleDownloadPDF,
  tableRef,
  navigate,
  id,
}) => {
  if (!salesData) return null;

  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/sales")}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">Sales Details</CardTitle>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/sales/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
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
                documentTitle="Sales Report"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <CommonPrintTemplate ref={tableRef} data={salesData} type="sales" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopSalesView;
