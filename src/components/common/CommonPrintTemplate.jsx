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

const CommonPrintTemplate = React.forwardRef(({ data, type, title: passedTitle }, ref) => {
  if (!data) return null;

  const isSales = type === "sales";
  const isPurchase = type === "purchase";

  const title = passedTitle || (
    isSales ? "Jaju's Sales Estimate" :
      isPurchase ? "Jaju's Purchase Estimate" :
        "Jaju's Rough Estimate"
  );

  const rawData = isSales
    ? data?.data || data?.sales || data
    : isPurchase
      ? data?.data || data?.purchase || data
      : data?.data || data?.estimate || data;

  const rawSub =
    rawData?.subs ||
    (isSales ? data?.salesSub : isPurchase ? data?.purchaseSub : data?.estimateSub) ||
    rawData?.salesSub ||
    rawData?.purchaseSub ||
    rawData?.estimateSub ||
    [];

  const date = rawData?.sales_date || rawData?.purchase_date || rawData?.estimate_date;
  const no = rawData?.sales_no || rawData?.purchase_bill_no || rawData?.purchase_no || rawData?.estimate_no;
  const customer = rawData?.sales_customer || rawData?.purchase_supplier || rawData?.estimate_customer;
  const mobile = rawData?.sales_mobile || rawData?.purchase_mobile || rawData?.estimate_mobile || "";
  const address = rawData?.sales_address || rawData?.purchase_address || rawData?.estimate_address || "";

  const items = (rawSub || []).map((item) => ({
    name: item.sales_sub_item || item.purchase_sub_item || item.estimate_sub_item || "",
    pcs:
      item.sales_sub_pcs ||
      item.purchase_sub_pcs ||
      item.estimate_sub_pcs ||
      item.estimate_sub_qnty ||
      "",
    sqft: item.sales_sub_qnty_sqr || item.purchase_sub_qnty_sqr || item.estimate_sub_qnty_sqr || "",
    rate: item.sales_sub_rate || item.purchase_sub_rate || item.estimate_sub_rate || 0,
    amount: item.sales_sub_amount || item.purchase_sub_amount || item.estimate_sub_amount || 0,
  }));

  const subTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );
  const tempo = parseFloat(
    rawData?.sales_tempo || rawData?.purchase_tempo || rawData?.estimate_tempo || 0,
  );
  const labourLabel =
    rawData?.sales_labour_label ||
    rawData?.purchase_labour_label ||
    rawData?.estimate_labour_label ||
    "Labour Charges";
  const labourValue = parseFloat(
    rawData?.sales_labour_value ||
    rawData?.estimate_labour_value ||
    rawData?.purchase_labour_value ||
    rawData?.sales_loading ||
    rawData?.estimate_loading ||
    rawData?.purchase_loading ||
    rawData?.sales_unloading ||
    rawData?.estimate_unloading ||
    rawData?.purchase_unloading ||
    0,
  );
  const other =
    parseFloat(rawData?.sales_other || rawData?.estimate_other || rawData?.purchase_other || 0);
  const other1 =
    parseFloat(rawData?.sales_other1 || rawData?.estimate_other1 || rawData?.purchase_other1 || 0);

  const grossTotal = subTotal + tempo + labourValue + other + other1;
  const tax = parseFloat(rawData?.sales_tax || rawData?.estimate_tax || rawData?.purchase_tax || 0);
  const netTotal = grossTotal + tax;
  const roundOff = parseFloat(
    rawData?.sales_amount_round || rawData?.estimate_amount_round || rawData?.purchase_amount_round || 0,
  );

  const amountCollected = parseFloat(
    rawData?.sales_amount_received || rawData?.estimate_advance || rawData?.purchase_amount_paid || 0,
  );
  const finalPayable = netTotal + roundOff;

  return (
    <div
      ref={ref}
      className="w-full bg-white text-black p-6 font-sans border border-gray-300 rounded-lg shadow-sm print:border-none print:shadow-none print:pt-[10mm] print:pb-[10mm] print:pr-[10mm] print:pl-[20mm] print:m-0"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-wide text-gray-900">
            {title}
          </h2>
          <p className="text-sm gray-600 mt-1 max-w-[320px] sm:max-w-md">
            #857, 80 feet Technology Road, Ganakal <br /> BSK 6th Stage, 11th Block, Bangalore
          </p>
        </div>
        <div className="text-right text-sm space-y-0.5 text-gray-800">
          <p className="font-semibold">Owner Mobile : 9742042097</p>
          <p>Pappu Kumar : 9108130362</p>
          <p>Sonu Kumar : 8696989562</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm border p-3 bg-gray-50/50 rounded-lg">
        <div className="text-left">
          <span className="font-semibold text-gray-700">
            {isSales ? "Bill No:" : isPurchase ? "JFC Bill No:" : "Estimate No:"}
          </span>
          <span className="ml-2 font-bold text-gray-900">{no || "N/A"}</span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-700">Date:</span>
          <span className="ml-2 font-medium">
            {date ? moment(date).format("DD-MMM-YYYY") : "N/A"}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border p-3 rounded-lg mb-4 text-sm bg-white space-y-1">
        <div className="flex justify-between">
          <div>
            <span className="font-semibold text-gray-700">
              {isPurchase ? "Supplier:" : "Customer:"}
            </span>
            <span className="ml-2 font-medium">{customer || "N/A"}</span>
          </div>
          {mobile && (
            <div className="padding pr-6">
              <span className="font-semibold text-gray-700">Number:</span>
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
      <Table className="border mb-4 text-sm w-full table-fixed">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead rowSpan={2} className="text-center font-bold text-black border-r w-[6%] align-middle">
              Sl No
            </TableHead>
            <TableHead rowSpan={2} className="text-left font-bold text-black border-r pl-4 w-[39%] align-middle">
              Item Name
            </TableHead>
            <TableHead colSpan={2} className="text-center font-bold text-black border-r w-[40%] py-0">
              Quantity
            </TableHead>
            <TableHead rowSpan={2} className="text-right font-bold text-black border-r pr-4 w-[10%] align-middle">
              Rate
            </TableHead>
            <TableHead rowSpan={2} className="text-right font-bold text-black pr-4 w-[20%] align-middle">
              Amount
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="text-right font-bold text-black border-r pr-4 py-1 w-[10%]">
              Pcs / Box
            </TableHead>
            <TableHead className="text-right font-bold text-black border-r pr-4 py-1 w-[10%]">
              Sqft
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="hover:bg-transparent text-sm border-b">
              <TableCell className="text-center border-r py-2">
                {index + 1}
              </TableCell>
              <TableCell className="text-left  border-r pl-4 py-2 font-medium break-words whitespace-normal">
                {item.name}
              </TableCell>
              <TableCell className="text-right border-r pr-4 py-2">
                {item.pcs || "-"}
              </TableCell>
              <TableCell className="text-right border-r pr-4 py-2">
                {item.sqft || "-"}
              </TableCell>
              <TableCell className="text-right border-r font-semibold text-md pr-4 py-2">
                {parseFloat(item.rate || 0).toFixed(0)}
              </TableCell>
              <TableCell className="text-right pr-4 py-2 font-semibold">
                {parseFloat(item.amount || 0).toFixed(0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-transparent border-t border-gray-300">
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="text-right border-r font-medium py-3"
            >
              Sub Total
            </TableCell>
            <TableCell className="text-right pr-4 font-bold py-3">
              {subTotal.toFixed(0)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="text-right border-r font-medium py-3"
            >
              Tempo Charges
            </TableCell>
            <TableCell className="text-right pr-4 py-3">
              {tempo.toFixed(0)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="text-right border-r font-medium py-3"
            >
              {labourLabel}
            </TableCell>
            <TableCell className="text-right pr-4 py-3">
              {labourValue.toFixed(0)}
            </TableCell>
          </TableRow>
          {other > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="text-right border-r font-medium py-3"
              >
                {rawData?.sales_other_label ||
                  rawData?.estimate_other_label ||
                  rawData?.purchase_other_label ||
                  "Other Charges"}
              </TableCell>
              <TableCell className="text-right pr-4 py-3">
                {other.toFixed(0)}
              </TableCell>
            </TableRow>
          )}
          {other1 > 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="text-right border-r font-medium py-3"
              >
                {rawData?.sales_other1_label ||
                  rawData?.estimate_other1_label ||
                  rawData?.purchase_other1_label ||
                  "Other Charges 2"}
              </TableCell>
              <TableCell className="text-right pr-4 py-3">
                {other1.toFixed(0)}
              </TableCell>
            </TableRow>
          )}
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableCell
              colSpan={5}
              className="text-right border-r font-bold py-3"
            >
              Gross Total
            </TableCell>
            <TableCell className="text-right pr-4 font-extrabold py-3 text-blue-900">
              {grossTotal.toFixed(0)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="text-right border-r font-medium py-3"
            >
              Tax (GST 18% = {(grossTotal * 0.18).toFixed(0)})
            </TableCell>
            <TableCell className="text-right pr-4 py-3">
              {tax.toFixed(0)}
            </TableCell>
          </TableRow>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableCell
              colSpan={5}
              className="text-right border-r font-bold py-3"
            >
              Net Total
            </TableCell>
            <TableCell className="text-right pr-4 font-extrabold py-3 text-indigo-900">
              {netTotal.toFixed(0)}
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="text-right border-r font-medium py-3"
            >
              Round Off
            </TableCell>
            <TableCell className="text-right pr-4 py-3">
              {roundOff >= 0 ? `+${roundOff.toFixed(0)}` : roundOff.toFixed(0)}
            </TableCell>
          </TableRow>
          {/* <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-right border-r font-medium py-3">
              Amount Collected
            </TableCell>
            <TableCell className="text-right pr-4 py-3 text-green-700 font-semibold">
              {amountCollected.toFixed(0)}
            </TableCell>
          </TableRow> */}
          <TableRow className="bg-gray-100/50 text-black font-bold hover:bg-gray-100/50 border-t border-b border-gray-300">
            <TableCell
              colSpan={5}
              className="text-right border-r text-black py-4"
            >
              Final Amount
            </TableCell>
            <TableCell className="text-right pr-4 text-black font-extrabold py-4 text-sm">
              {finalPayable.toFixed(0)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
});

CommonPrintTemplate.displayName = "CommonPrintTemplate";

export default CommonPrintTemplate;
