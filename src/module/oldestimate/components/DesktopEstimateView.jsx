import React from "react";
import { ChevronLeft, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommonPrintTemplate from "@/components/common/CommonPrintTemplate";

const DesktopEstimateView = ({
  estimateData,
  handleDownloadPDF,
  tableRef,
  navigate,
}) => {
  if (!estimateData) return null;

  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/oldestimate")}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">Old Estimate Details</CardTitle>
            </div>
            <div className="flex justify-end gap-2">
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
                documentTitle="Estimate Report"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <CommonPrintTemplate ref={tableRef} data={estimateData} type="estimate" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopEstimateView;
