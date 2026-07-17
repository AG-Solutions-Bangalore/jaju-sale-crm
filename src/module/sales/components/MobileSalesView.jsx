import React from "react";
import { ChevronLeft, Edit, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Loader2 } from "lucide-react";
import CommonPrintTemplate from "@/components/common/CommonPrintTemplate";

const MobileSalesView = ({
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
  amountToBeCollected,
  isLoading,
  handleDownloadPDF,
  tableRef,
  navigate,
  id,
}) => {
  if (!salesData) return null;

  return (
    <div className="sm:hidden">
      <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-white shadow-sm p-0 mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => navigate("/sales")}
                className="rounded-full p-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-gray-800">
                Sales Details
              </h1>
            </div>
            <div className="flex justify-end pr-2 gap-1.5">
              <button
                type="button"
                className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-b-md"
                onClick={() => navigate(`/sales/edit/${id}`)}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-b-md"
                onClick={handleDownloadPDF}
              >
                <FaRegFilePdf className="h-4 w-4" />
              </button>
              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm p-3 rounded-b-md"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                )}
                content={() => tableRef.current}
                documentTitle="Sales Report"
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
          <CommonPrintTemplate ref={tableRef} data={salesData} type="sales" />
        )}
      </div>
    </div>
  );
};

export default MobileSalesView;
