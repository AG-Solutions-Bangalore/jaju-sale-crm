import React from "react";
import { ChevronLeft, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import CommonPrintTemplate from "@/components/common/CommonPrintTemplate";

const MobileEstimateView = ({
  estimateData,
  isLoading,
  handleDownloadPDF,
  tableRef,
  navigate,
}) => {
  if (!estimateData) return null;

  return (
    <div className="sm:hidden">
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => navigate("/estimate")}
                className="rounded-full p-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-gray-800">
                Estimate Details
              </h1>
            </div>
            <div className="flex gap-[2px]">
              <button
                type="button"
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={handleDownloadPDF}
              >
                <FaRegFilePdf className="h-4 w-4" />
              </button>
              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                )}
                content={() => tableRef.current}
                documentTitle="Estimate Report"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <CommonPrintTemplate ref={tableRef} data={estimateData} type="estimate" />
        )}
      </div>
    </div>
  );
};

export default MobileEstimateView;
