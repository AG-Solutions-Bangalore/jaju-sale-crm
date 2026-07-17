import React from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CommonPrintTemplate = React.forwardRef(({ data, type }, ref) => {
  if (!data) return null;

  const isSales = type === "sales";
  const title = "ESTIMATE";

  const rawData = isSales ? data?.sales : data?.estimate;
  const rawSub = isSales ? data?.salesSub : data?.estimateSub;

  const date = rawData?.sales_date || rawData?.estimate_date;
  const no = rawData?.sales_no || rawData?.estimate_no;
  const customer = rawData?.sales_customer || rawData?.estimate_customer;
  const mobile = rawData?.sales_mobile || rawData?.estimate_mobile || "";
  const address = rawData?.sales_address || rawData?.estimate_address || "";

  const items = (rawSub || []).map((item) => ({
    name: item.sales_sub_item || item.estimate_sub_item || "",
    pcs: item.sales_sub_pcs || item.estimate_sub_pcs || item.estimate_sub_qnty || "",
    sqft: item.sales_sub_qnty_sqr || item.estimate_sub_qnty_sqr || "",
    rate: item.sales_sub_rate || item.estimate_sub_rate || 0,
    amount: item.sales_sub_amount || item.estimate_sub_amount || 0,
  }));

  const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const tempo = parseFloat(rawData?.sales_tempo || rawData?.estimate_tempo || 0);
  const loading = parseFloat(rawData?.sales_loading || rawData?.estimate_loading || 0);
  const unloading = parseFloat(rawData?.sales_unloading || rawData?.estimate_unloading || 0);
  const other =
    parseFloat(rawData?.sales_other || rawData?.estimate_other || 0) +
    parseFloat(rawData?.sales_other1 || 0);

  const grossTotal = subTotal + tempo + loading + unloading + other;
  const tax = parseFloat(rawData?.sales_tax || rawData?.estimate_tax || 0);
  const netTotal = grossTotal + tax;
  const roundOff = parseFloat(rawData?.sales_amount_round || rawData?.estimate_amount_round || 0);

  const amountCollected = parseFloat(rawData?.sales_amount_received || rawData?.estimate_advance || 0);
  const finalPayable = netTotal + roundOff;

  return (
    <div
      ref={ref}
      className="w-full bg-white text-black p-6 font-sans border border-gray-300 rounded-lg shadow-sm print:border-none print:shadow-none print:pt-[10mm] print:pb-[10mm] print:pr-[10mm] print:pl-[20mm] print:m-0"
    >
      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold tracking-wide text-gray-900">JAJU'S</h2>
        <h3 className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs border p-3 bg-gray-50/50 rounded-lg">
        <div>
          <span className="font-semibold text-gray-700">Date:</span>
          <span className="ml-2 font-medium">
            {date ? moment(date).format("DD-MMM-YYYY") : "N/A"}
          </span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-700">
            {isSales ? "Bill No:" : "Estimate No:"}
          </span>
          <span className="ml-2 font-bold text-gray-900">{no || "N/A"}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border p-3 rounded-lg mb-4 text-xs bg-white space-y-1">
        <div className="flex justify-between">
          <div>
            <span className="font-semibold text-gray-700">Customer:</span>
            <span className="ml-2 font-medium">{customer || "N/A"}</span>
          </div>
          {mobile && (
            <div>
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="ml-2 font-medium">{mobile}</span>
            </div>
          )}
        </div>
        {address && (
          <div>
            <span className="font-semibold text-gray-700">Address:</span>
            <span className="ml-2 text-gray-600">{address}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <Table className="border mb-4 text-xs w-full table-fixed">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="text-center font-bold text-black border-r w-[6%]">Sl No</TableHead>
            <TableHead className="text-left font-bold text-black border-r pl-4 w-[39%]">Item Name</TableHead>
            <TableHead className="text-right font-bold text-black border-r pr-4 w-[10%]">Pcs/Box</TableHead>
            <TableHead className="text-right font-bold text-black border-r pr-4 w-[10%]">Sqft</TableHead>
            <TableHead className="text-right font-bold text-black border-r pr-4 w-[15%]">Rate</TableHead>
            <TableHead className="text-right font-bold text-black pr-4 w-[20%]">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="hover:bg-transparent border-b">
              <TableCell className="text-center border-r py-4">{index + 1}</TableCell>
              <TableCell className="text-left border-r pl-4 py-4 font-medium break-words whitespace-normal">{item.name}</TableCell>
              <TableCell className="text-right border-r pr-4 py-4">{item.pcs || "-"}</TableCell>
              <TableCell className="text-right border-r pr-4 py-4">{item.sqft || "-"}</TableCell>
              <TableCell className="text-right border-r pr-4 py-4">
                {parseFloat(item.rate || 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-right pr-4 py-4 font-semibold">
                {parseFloat(item.amount || 0).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-transparent border-t border-gray-300">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Sub Total
            </TableCell>
            <TableCell className="text-right pr-4 font-bold py-3">{subTotal.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Tempo Charges
            </TableCell>
            <TableCell className="text-right pr-4 py-3">{tempo.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Loading & Unloading Charges
            </TableCell>
            <TableCell className="text-right pr-4 py-3">{(loading + unloading).toFixed(2)}</TableCell>
          </TableRow>
          {other > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="text-right border-r font-medium py-3">
                {rawData?.sales_other_label || rawData?.estimate_other_label || "Other Charges"}
              </TableCell>
              <TableCell className="text-right pr-4 py-3">{other.toFixed(2)}</TableCell>
            </TableRow>
          )}
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableCell colSpan={5} className="text-right border-r font-bold py-3">
              Gross Total
            </TableCell>
            <TableCell className="text-right pr-4 font-extrabold py-3 text-blue-900">
              {grossTotal.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              GST (18%)
            </TableCell>
            <TableCell className="text-right pr-4 py-3">{tax.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableCell colSpan={5} className="text-right border-r font-bold py-3">
              Net Total
            </TableCell>
            <TableCell className="text-right pr-4 font-extrabold py-3 text-indigo-900">
              {netTotal.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Manual Round Off
            </TableCell>
            <TableCell className="text-right pr-4 py-3">
              {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Amount Collected
            </TableCell>
            <TableCell className="text-right pr-4 py-3 text-green-700 font-semibold">
              {amountCollected.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow className="bg-gray-100/50 text-black font-bold hover:bg-gray-100/50 border-t border-b border-gray-300">
            <TableCell colSpan={5} className="text-right border-r text-black py-4">
              Final Payable
            </TableCell>
            <TableCell className="text-right pr-4 text-black font-extrabold py-4 text-sm">
              {finalPayable.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
});

CommonPrintTemplate.displayName = "CommonPrintTemplate";

export default CommonPrintTemplate;
