import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import useNumericInput from "@/hooks/useNumericInput";
import {
  useCurrentYear,
  useProductTypeGroup,
  useEstimateById,
  useCreateSales,
} from "../hooks/useSales";
import MobileEstimateSalesForm from "../components/MobileEstimateSalesForm";
import DesktopEstimateSalesForm from "../components/DesktopEstimateSalesForm";

const typeOptions = [
  { value: "Granites", label: "Granites" },
  { value: "Tiles", label: "Tiles" },
];

const formSchema = z.object({
  sales_date: z.string(),
  sales_year: z.string(),
  sales_customer: z.string(),
  sales_address: z.string(),
  sales_mobile: z.string(),
  sales_item_type: z.string(),
  sales_tax: z.string(),
  sales_tempo: z.string(),
  sales_loading: z.string(),
  sales_unloading: z.string(),
  sales_other: z.string(),
  sales_gross: z.string(),
  sales_advance: z.string(),
  sales_balance: z.string(),
  sales_temp_amount: z.string().optional(),
  sales_amount_round: z.string().optional(),
  sales_amount_received: z.string().optional(),
});

const EstimateSalesAddPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: currentYear } = useCurrentYear();
  const { data: salesEstimateId, isLoading: isEstimateLoading } = useEstimateById(id);
  const { data: productTypeGroup = [], isLoading: isLoadingItems, refetch: refetchProducts } = useProductTypeGroup();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sales_date: moment().format("YYYY-MM-DD"),
      sales_year: "",
      sales_customer: "",
      sales_address: "",
      sales_mobile: "",
      sales_no: "",
      sales_item_type: "",
      sales_tax: "",
      sales_tempo: "",
      sales_loading: "",
      sales_unloading: "",
      sales_other: "",
      sales_gross: "",
      sales_advance: "",
      sales_balance: "",
      sales_temp_amount: "",
      sales_amount_round: "",
      sales_amount_received: "",
    },
  });

  const createSalesMutation = useCreateSales();

  const [itemEntries, setItemEntries] = useState([
    {
      id: "",
      estimate_sub_type: "",
      estimate_sub_item: "",
      estimate_sub_qnty: "",
      estimate_sub_qnty_sqr: "",
      estimate_sub_rate: "",
      estimate_sub_amount: "",
      sales_sub_item_original: "",
    },
  ]);

  const productOptions = useMemo(() => {
    return productTypeGroup.map((item) => ({
      value: item.product_type,
      label: item.product_type,
    }));
  }, [productTypeGroup]);

  // Load existing estimate data
  useEffect(() => {
    if (salesEstimateId) {
      const { estimate: sId, estimateSub: sSub } = salesEstimateId;

      const formatToInteger = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "" : Math.round(parsed).toString();
      };

      const formValues = {
        sales_date: moment(sId.estimate_date).format("YYYY-MM-DD"),
        sales_year: sId.estimate_year || currentYear || "",
        sales_item_type: sId.estimate_item_type || "Granites",
        sales_customer: sId.estimate_customer || "",
        sales_address: sId.estimate_address || "",
        sales_mobile: sId.estimate_mobile || "",
        sales_other: formatToInteger(sId.estimate_other),
        sales_tempo: formatToInteger(sId.estimate_tempo),
        sales_tax: formatToInteger(sId.estimate_tax),
        sales_gross: formatToInteger(sId.estimate_gross),
        sales_loading: formatToInteger(sId.estimate_loading),
        sales_unloading: formatToInteger(sId.estimate_unloading),
        sales_advance: formatToInteger(sId.estimate_advance),
        sales_balance: formatToInteger(sId.estimate_balance),
        sales_temp_amount: formatToInteger(sId.estimate_gross),
        sales_amount_round: "",
        sales_amount_received: formatToInteger(sId.estimate_advance),
      };
      form.reset(formValues);

      if (sSub && sSub.length > 0) {
        const mappedData = sSub.map((sub) => ({
          id: sub.id || "",
          estimate_sub_type: sub.estimate_sub_type || "",
          estimate_sub_item: sub.estimate_sub_item || "",
          estimate_sub_qnty: sub.estimate_sub_qnty?.toString() || "",
          estimate_sub_qnty_sqr: sub.estimate_sub_qnty_sqr?.toString() || "",
          estimate_sub_rate: formatToInteger(sub.estimate_sub_rate),
          estimate_sub_amount: formatToInteger(sub.estimate_sub_amount),
          sales_sub_item_original: sub.estimate_sub_item || "",
        }));
        setItemEntries(mappedData);
      }
      setIsInitialLoading(false);
    }
  }, [salesEstimateId, currentYear]);

  const calculateAndSetTotals = (entries) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimate_sub_amount || 0),
      0
    );
    const tax = parseFloat(form.getValues("sales_tax") || 0);
    const tempo = parseFloat(form.getValues("sales_tempo") || 0);
    const loading = parseFloat(form.getValues("sales_loading") || 0);
    const unloading = parseFloat(form.getValues("sales_unloading") || 0);
    const other = parseFloat(form.getValues("sales_other") || 0);

    const netTotal = itemsTotal + tax + tempo + loading + unloading + other;
    form.setValue("sales_temp_amount", netTotal.toString());

    const roundOff = parseFloat(form.getValues("sales_amount_round") || 0);
    const finalAmount = netTotal + roundOff;

    form.setValue("sales_gross", finalAmount.toString());
    const amountReceived = parseFloat(form.getValues("sales_amount_received") || 0);
    form.setValue("sales_advance", amountReceived.toString());
    form.setValue("sales_balance", (finalAmount - amountReceived).toString());
  };

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "estimate_sub_qnty_sqr" || field === "estimate_sub_rate") &&
      updatedEntries[index].estimate_sub_qnty_sqr &&
      updatedEntries[index].estimate_sub_rate
    ) {
      updatedEntries[index].estimate_sub_amount = Math.round(
        parseFloat(updatedEntries[index].estimate_sub_qnty_sqr || 0) *
          parseFloat(updatedEntries[index].estimate_sub_rate || 0)
      ).toString();
      setItemEntries([...updatedEntries]);
    }
    calculateAndSetTotals(updatedEntries);
  };

  const handleChargeChange = (field, value) => {
    form.setValue(field, value);
    calculateAndSetTotals(itemEntries);
  };

  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    if (value === "" || value === "-" || value === "-." || value === ".") {
      form.setValue("sales_amount_round", value);
      const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
      form.setValue("sales_gross", netTotal.toString());
      const amountReceived = parseFloat(form.getValues("sales_amount_received") || 0);
      form.setValue("sales_balance", (netTotal - amountReceived).toString());
      return;
    }

    if (/^-?\d*\.?\d*$/.test(value)) {
      const roundOffVal = parseFloat(value) || 0;
      form.setValue("sales_amount_round", value);

      const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
      const finalAmount = netTotal + roundOffVal;
      form.setValue("sales_gross", finalAmount.toString());
      const amountReceived = parseFloat(form.getValues("sales_amount_received") || 0);
      form.setValue("sales_balance", (finalAmount - amountReceived).toString());
    }
  };

  const handleAmountReceivedChange = (e) => {
    const value = e.target.value;
    if (value === "" || value === ".") {
      form.setValue("sales_amount_received", value);
      form.setValue("sales_advance", "0");
      const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
      const roundOffVal = parseFloat(form.getValues("sales_amount_round") || 0);
      const finalAmount = netTotal + roundOffVal;
      form.setValue("sales_balance", finalAmount.toString());
      return;
    }

    if (/^\d*\.?\d*$/.test(value)) {
      const receivedVal = parseFloat(value) || 0;
      form.setValue("sales_amount_received", value);
      form.setValue("sales_advance", receivedVal.toString());

      const netTotal = parseFloat(form.getValues("sales_temp_amount") || 0);
      const roundOffVal = parseFloat(form.getValues("sales_amount_round") || 0);
      const finalAmount = netTotal + roundOffVal;
      form.setValue("sales_balance", (finalAmount - receivedVal).toString());
    }
  };

  const addItemEntry = () => {
    const updated = [
      ...itemEntries,
      {
        estimate_sub_type: "",
        estimate_sub_item: "",
        estimate_sub_qnty: "",
        estimate_sub_qnty_sqr: "",
        estimate_sub_rate: "",
        estimate_sub_amount: "",
        sales_sub_item_original: "",
      },
    ];
    setItemEntries(updated);
    calculateAndSetTotals(updated);
  };

  const removeItemEntry = (index) => {
    const updatedEntries = [...itemEntries];
    updatedEntries.splice(index, 1);
    setItemEntries(updatedEntries);
    calculateAndSetTotals(updatedEntries);
  };

  const validateForm = (data) => {
    const formErrors = {
      date: !data.sales_date ? "Date is required" : "",
      customer: !data.sales_customer ? "Customer name is required" : "",
      itemType: !data.sales_item_type ? "Item type is required" : "",
    };

    const itemErrors = itemEntries.map((entry) => ({
      type: !entry.estimate_sub_type ? "required" : "",
      originalItem: !entry.sales_sub_item_original ? "required" : "",
      item: !entry.estimate_sub_item ? "required" : "",
      qnty: !entry.estimate_sub_qnty
        ? "required"
        : isNaN(entry.estimate_sub_qnty)
        ? "Quantity must be a number"
        : "",
      qntySqr: !entry.estimate_sub_qnty_sqr
        ? "required"
        : isNaN(entry.estimate_sub_qnty_sqr)
        ? "Quantity (sqr) must be a number"
        : "",
      rate: !entry.estimate_sub_rate
        ? "required"
        : isNaN(entry.estimate_sub_rate)
        ? "Rate must be a number"
        : "",
    }));

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.type || err.item || err.qnty || err.qntySqr || err.rate || err.originalItem
    );

    return { formErrors, itemErrors, hasFormErrors, hasItemErrors };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = form.getValues();
    const { formErrors, itemErrors, hasFormErrors, hasItemErrors } =
      validateForm(formData);

    if (hasFormErrors || hasItemErrors) {
      toast({
        title: "Validation Errors",
        description: (
          <div className="w-full space-y-3 text-xs max-h-[60vh] overflow-y-auto">
            {hasFormErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Form Errors</div>
                <table className="w-full border-collapse border border-red-200 rounded-md">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Field
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formErrors.date && (
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                          Date
                        </td>
                        <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                          {formErrors.date}
                        </td>
                      </tr>
                    )}
                    {formErrors.customer && (
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-gray-600 border-b border-gray-200 font-medium">
                          Customer
                        </td>
                        <td className="px-2 py-1.5 text-red-600 border-b border-gray-200 break-all">
                          {formErrors.customer}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {hasItemErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Item Errors</div>
                <table className="w-full border-collapse border border-red-200 rounded-md">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200 w-8">
                        #
                      </th>
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Type
                      </th>
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Item
                      </th>
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Qty
                      </th>
                      <th className="px-1.5 py-1.5 text-left text-xs font-medium text-red-800 border-b border-red-200">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemErrors.map(
                      (error, i) =>
                        (error.type || error.item || error.qnty || error.qntySqr || error.rate) && (
                          <tr key={i} className="bg-white hover:bg-gray-50">
                            <td className="px-1.5 py-1.5 text-center text-gray-600 border-b border-gray-200 font-medium">
                              {i + 1}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200 break-all">
                              {error.type}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200 break-all">
                              {error.item}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                              {error.qnty}
                            </td>
                            <td className="px-1.5 py-1.5 text-red-600 font-mono text-right border-b border-gray-200 break-all">
                              {error.rate}
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      setIsSubmitting(false);
      return;
    }

    await onSubmit(formData);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        sales_date: data.sales_date || moment().format("YYYY-MM-DD"),
        sales_estimate_ref: salesEstimateId?.estimate?.estimate_ref || id || data.sales_estimate_ref || "",
        sales_customer: data.sales_customer || data.estimate_customer || "",
        sales_address: data.sales_address || data.estimate_address || "",
        sales_mobile: data.sales_mobile || data.estimate_mobile || "",
        sales_tax: data.sales_tax?.toString() || "0",
        sales_tempo: data.sales_tempo?.toString() || "0",
        sales_labour_label: data.sales_labour_label || "Labour Charges",
        sales_labour_value: (parseFloat(data.sales_loading || 0) + parseFloat(data.sales_unloading || 0)).toString(),
        sales_other_label: data.sales_other_label || "Other Charges",
        sales_other: data.sales_other?.toString() || "0",
        sales_other1_label: data.sales_other1_label || "Other Charges 1",
        sales_other1: data.sales_other1?.toString() || "0",
        sales_gross: data.sales_gross?.toString() || "0",
        sales_net_total: data.sales_temp_amount?.toString() || "0",
        sales_amount_round: data.sales_amount_round?.toString() || "0",
        sales_amount_payable: data.sales_gross?.toString() || "0",
        sales_amount_received: data.sales_amount_received?.toString() || "0",
        subs: itemEntries.map((e) => ({
          ...(e.id ? { id: e.id } : {}),
          sales_sub_item: e.estimate_sub_item || e.sales_sub_item || "",
          sales_sub_qnty_sqr: e.estimate_sub_qnty_sqr || e.sales_sub_qnty_sqr || "0",
          sales_sub_pcs: e.estimate_sub_qnty || e.estimate_sub_pcs || e.sales_sub_pcs || "0",
          sales_sub_rate: e.estimate_sub_rate || e.sales_sub_rate || "0",
          sales_sub_amount: e.estimate_sub_amount || e.sales_sub_amount || "0",
        })),
      };

      await createSalesMutation.mutateAsync(payload);
      navigate("/sales");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sales from estimate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/oldestimate");
  };

  if (isEstimateLoading || isInitialLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Page>
    );
  }

  const commonProps = {
    form,
    itemEntries,
    handleItemChange,
    addItemEntry,
    removeItemEntry,
    handleChargeChange,
    handleRoundOffChange,
    handleAmountReceivedChange,
    handleCancel,
    handleFormSubmit,
    productTypeGroup,
    productOptions,
    typeOptions,
    handleKeyDown,
    refetchProducts,
    isLoadingItems,
    isSubmitting,
  };

  return (
    <Page>
      <MobileEstimateSalesForm {...commonProps} />
      <DesktopEstimateSalesForm {...commonProps} />
    </Page>
  );
};

export default EstimateSalesAddPage;
