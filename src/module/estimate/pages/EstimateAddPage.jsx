import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import Page from "@/app/dashboard/page";
import useNumericInput from "@/hooks/useNumericInput";
import {
  useCurrentYear,
  useLatestEstimateRef,
  useCreateEstimate,
  useProductTypeGroup,
} from "../hooks/useEstimate";
import MobileEstimateForm from "../components/MobileEstimateForm";
import DesktopEstimateForm from "../components/DesktopEstimateForm";

const formSchema = z.object({
  estimate_date: z.string(),
  estimate_year: z.string(),
  estimate_customer: z.string(),
  estimate_address: z.string(),
  estimate_mobile: z.string(),
  estimate_tax: z.string(),
  estimate_tempo: z.string(),
  estimate_loading: z.string(),
  estimate_unloading: z.string(),
  estimate_other_label: z.string().optional(),
  estimate_other: z.string(),
  estimate_other1_label: z.string().optional(),
  estimate_other1: z.string(),
  estimate_gross: z.string(),
  estimate_advance: z.string(),
  estimate_balance: z.string(),
  estimate_amount: z.string().optional(),
  estimate_temp_amount: z.string(),
  estimate_amount_round: z.string().optional(),
});

const EstimateAddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleKeyDown = useNumericInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingType, setLoadingType] = useState("Loading Only");
  const [gstEdited, setGstEdited] = useState(false);
  const [autoGst18, setAutoGst18] = useState(0);
  const saveActionRef = useRef("exit");

  const [itemEntries, setItemEntries] = useState([
    {
      estimate_sub_item: "",
      estimate_sub_qnty: "",
      estimate_sub_qnty_sqr: "",
      estimate_sub_pcs: "",
      estimate_sub_rate: "",
      estimate_sub_amount: "",
    },
  ]);
  const [customItems, setCustomItems] = useState({});
  const [isCustomItem, setIsCustomItem] = useState({});

  const handleCustomItemChange = (index, value) => {
    setCustomItems((prev) => ({ ...prev, [index]: value }));
  };

  const handleToggleCustomItem = (index) => {
    const isCurrentlyCustom = isCustomItem[index];
    if (isCurrentlyCustom) {
      setCustomItems((prev) => ({ ...prev, [index]: "" }));
    } else {
      const selectedItem = itemEntries[index]?.estimate_sub_item || "";
      setCustomItems((prev) => ({ ...prev, [index]: selectedItem }));
    }
    setIsCustomItem((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Hooks
  const { data: currentYear } = useCurrentYear();
  const { data: product = [] } = useProductTypeGroup();

  const productOptions = useMemo(() => {
    return product.map((item) => {
      const name = item.item_name || item.product_type_group || item.product_type;
      return { value: name, label: name };
    });
  }, [product]);
  const { data: estimateRef = "" } = useLatestEstimateRef();
  const createMutation = useCreateEstimate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimate_date: moment().format("YYYY-MM-DD"),
      estimate_year: currentYear || "",
      estimate_customer: "",
      estimate_address: "",
      estimate_mobile: "",
      estimate_tax: "",
      estimate_tempo: "",
      estimate_loading: "",
      estimate_unloading: "",
      estimate_other_label: "",
      estimate_other: "",
      estimate_other1_label: "",
      estimate_other1: "",
      estimate_gross: "",
      estimate_advance: "",
      estimate_balance: "",
      estimate_amount: "",
      estimate_temp_amount: "",
      estimate_amount_round: "",
    },
  });

  useEffect(() => {
    if (currentYear) {
      form.setValue("estimate_year", currentYear);
    }
  }, [currentYear, form]);

  const handleItemChange = (index, field, value) => {
    const updatedEntries = [...itemEntries];
    updatedEntries[index][field] = value;
    setItemEntries(updatedEntries);

    if (
      (field === "estimate_sub_qnty_sqr" || field === "estimate_sub_rate") &&
      updatedEntries[index].estimate_sub_qnty_sqr &&
      updatedEntries[index].estimate_sub_rate
    ) {
      updatedEntries[index].estimate_sub_amount = (
        parseFloat(updatedEntries[index].estimate_sub_qnty_sqr || 0) *
        parseFloat(updatedEntries[index].estimate_sub_rate || 0)
      ).toString();
      setItemEntries([...updatedEntries]);
    }

    calculateAndSetTotals(updatedEntries);
  };

  const calculateAndSetTotals = (entries, skipGst = false) => {
    const itemsTotal = entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.estimate_sub_amount) || 0),
      0
    );
    const tempo = parseFloat(form.getValues("estimate_tempo") || 0);
    const loading = parseFloat(form.getValues("estimate_loading") || 0);
    const unloading = parseFloat(form.getValues("estimate_unloading") || 0);
    const other = parseFloat(form.getValues("estimate_other") || 0);
    const other1 = parseFloat(form.getValues("estimate_other1") || 0);

    const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
    setAutoGst18(grandTotal * 0.18);

    if (!skipGst && !gstEdited) {
      const gstVal = grandTotal * 0.18;
      form.setValue("estimate_tax", gstVal.toFixed(2));
    }
    const currentGst = parseFloat(form.getValues("estimate_tax") || 0);
    const netTotal = grandTotal + currentGst;

    form.setValue("estimate_temp_amount", netTotal.toFixed(2));

    const roundOff = parseFloat(form.getValues("estimate_amount_round") || 0);
    const finalAmount = netTotal + roundOff;

    form.setValue("estimate_gross", grandTotal.toString());
    form.setValue("estimate_amount", finalAmount.toString());
  };

  const handleChargeChange = (field, value) => {
    const numericVal = value.replace(/[^0-9.\-]/g, "");
    form.setValue(field, numericVal);
    if (field === "estimate_tax") {
      setGstEdited(true);
    }
    calculateAndSetTotals(itemEntries, field === "estimate_tax");
  };

  const handleRoundOffChange = (e) => {
    const value = e.target.value;
    if (value === "" || value === "-" || value === "-." || value === ".") {
      form.setValue("estimate_amount_round", value);
      const netTotal = parseFloat(form.getValues("estimate_temp_amount") || 0);
      form.setValue("estimate_gross", netTotal.toString());
      form.setValue("estimate_amount", netTotal.toString());
      return;
    }

    if (/^-?\d*\.?\d*$/.test(value)) {
      const roundOffVal = parseFloat(value) || 0;
      form.setValue("estimate_amount_round", value);

      const netTotal = parseFloat(form.getValues("estimate_temp_amount") || 0);
      const finalAmount = netTotal + roundOffVal;
      form.setValue("estimate_gross", netTotal.toString());
      form.setValue("estimate_amount", finalAmount.toString());
    }
  };

  const addItemEntry = () => {
    setItemEntries([
      ...itemEntries,
      {
        estimate_sub_item: "",
        estimate_sub_qnty: "",
        estimate_sub_qnty_sqr: "",
        estimate_sub_pcs: "",
        estimate_sub_rate: "",
        estimate_sub_amount: "",
      },
    ]);
  };

  const removeItemEntry = (index) => {
    const updatedEntries = [...itemEntries];
    updatedEntries.splice(index, 1);
    setItemEntries(updatedEntries);

    setCustomItems((prev) => {
      const newCustom = { ...prev };
      for (let i = index; i < updatedEntries.length; i++) {
        newCustom[i] = newCustom[i + 1];
      }
      delete newCustom[updatedEntries.length];
      return newCustom;
    });

    setIsCustomItem((prev) => {
      const newCustom = { ...prev };
      for (let i = index; i < updatedEntries.length; i++) {
        newCustom[i] = newCustom[i + 1];
      }
      delete newCustom[updatedEntries.length];
      return newCustom;
    });

    calculateAndSetTotals(updatedEntries);
  };

  const validateForm = (data) => {
    const formErrors = {
      date: !data.estimate_date ? "Date is required" : "",
      customer: !data.estimate_customer ? "Customer name is required" : "",
      mobile: !data.estimate_mobile ? "Mobile number is required" : "",
    };

    const itemErrors = itemEntries.map((entry, index) => ({
      item: isCustomItem[index]
        ? (!customItems[index] ? "required" : "")
        : (!entry.estimate_sub_item ? "required" : ""),
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
      // pcs: !entry.estimate_sub_pcs
      //   ? "required"
      //   : isNaN(entry.estimate_sub_pcs)
      //   ? "Pcs must be a number"
      //   : "",
      rate: !entry.estimate_sub_rate
        ? "required"
        : isNaN(entry.estimate_sub_rate)
        ? "Rate must be a number"
        : "",
    }));

    const hasFormErrors = Object.values(formErrors).some((err) => err);
    const hasItemErrors = itemErrors.some(
      (err) => err.item || err.qnty || err.qntySqr || err.pcs || err.rate
    );

    return { formErrors, itemErrors, hasFormErrors, hasItemErrors };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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
                <div className="w-full">
                  <table className="w-full border-collapse border border-red-200 rounded-md">
                    <thead>
                      <tr className="bg-red-50 text-red-800">
                        <th className="px-2 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Field
                        </th>
                        <th className="px-2 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formErrors.date && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Date
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.date}
                          </td>
                        </tr>
                      )}
                      {formErrors.customer && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Customer
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.customer}
                          </td>
                        </tr>
                      )}
                      {formErrors.mobile && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Mobile No
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.mobile}
                          </td>
                        </tr>
                      )}
                      {formErrors.itemType && (
                        <tr className="bg-white text-gray-700">
                          <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                            Item Type
                          </td>
                          <td className="px-2 py-1.5 text-red-600 border-b border-gray-200">
                            {formErrors.itemType}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hasItemErrors && (
              <div className="w-full">
                <div className="font-medium mb-2 text-white">Item Errors</div>
                <div className="w-full">
                  <table className="w-full border-collapse border border-red-200 rounded-md">
                    <thead>
                      <tr className="bg-red-50 text-red-800">
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200 w-8">
                          #
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Item
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Qty (pcs/box)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Qty (sqr)
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Pcs
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-xs font-medium border-b border-red-200">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemErrors.map(
                        (error, i) =>
                          (error.item ||
                            error.qnty ||
                            error.qntySqr ||
                            error.pcs ||
                            error.rate) && (
                            <tr key={i} className="bg-white text-gray-700">
                              <td className="px-1.5 py-1.5 text-center border-b border-gray-200 font-medium">
                                {i + 1}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 border-b border-gray-200">
                                {error.item}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.qnty}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.qntySqr}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.pcs}
                              </td>
                              <td className="px-1.5 py-1.5 text-red-600 text-right border-b border-gray-200">
                                {error.rate}
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </table>
                </div>
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
      const itemsTotal = itemEntries.reduce(
        (sum, entry) => sum + (parseFloat(entry.estimate_sub_amount) || 0),
        0
      );
      const tempo = parseFloat(data.estimate_tempo) || 0;
      const loading = parseFloat(data.estimate_loading) || 0;
      const unloading = parseFloat(data.estimate_unloading) || 0;
      const other = parseFloat(data.estimate_other) || 0;
      const other1 = parseFloat(data.estimate_other1) || 0;

      const grandTotal = itemsTotal + tempo + loading + unloading + other + other1;
      const gstAmount = parseFloat(data.estimate_tax) || 0;
      const netTotal = grandTotal + gstAmount;
      const roundOff = parseFloat(data.estimate_amount_round) || 0;
      const finalAmount = netTotal + roundOff;

      const payload = {
        estimate_date: data.estimate_date || moment().format("YYYY-MM-DD"),
        estimate_customer: data.estimate_customer || "",
        estimate_address: data.estimate_address || "",
        estimate_mobile: data.estimate_mobile || "",
        estimate_tax: gstAmount.toString(),
        estimate_tempo: tempo.toString(),
        estimate_labour_label: loadingType || data.estimate_labour_label || "Labour Charges",
        estimate_labour_value: (loading + unloading).toString(),
        estimate_other_label: data.estimate_other_label || "Other Charges",
        estimate_other: other.toString(),
        estimate_other1_label: data.estimate_other1_label || "Other Charges 1",
        estimate_other1: other1.toString(),
        estimate_gross: grandTotal.toString(),
        estimate_net_total: netTotal.toString(),
        estimate_amount_round: roundOff.toString(),
        estimate_amount: finalAmount.toString(),
        subs: itemEntries.map((item, index) => ({
          ...(item.id ? { id: item.id } : {}),
          estimate_sub_item: isCustomItem[index] ? customItems[index] : item.estimate_sub_item || "",
          estimate_sub_qnty_sqr: item.estimate_sub_qnty_sqr || "0",
          estimate_sub_pcs: item.estimate_sub_pcs || item.estimate_sub_qnty || "0",
          estimate_sub_rate: item.estimate_sub_rate || "0",
          estimate_sub_amount: item.estimate_sub_amount || "0",
        })),
      };

      createMutation.mutate(payload, {
        onSuccess: (response) => {
          const id = response?.data?.data || response?.data?.id || response?.data;
          if (saveActionRef.current === "print") {
            navigate(`/rough-estimate/view/${id}`);
          } else {
            navigate("/rough-estimate");
          }
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Estimate",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/rough-estimate");
  };

  const displayGrandTotal = itemEntries.reduce(
    (sum, entry) => sum + (parseFloat(entry.estimate_sub_amount) || 0),
    0
  ) +
  (parseFloat(form.watch("estimate_tempo")) || 0) +
  (parseFloat(form.watch("estimate_loading")) || 0) +
  (parseFloat(form.watch("estimate_unloading")) || 0) +
  (parseFloat(form.watch("estimate_other")) || 0) +
  (parseFloat(form.watch("estimate_other1")) || 0);

  const displayGst = parseFloat(form.watch("estimate_tax")) || 0;
  const displayNetTotal = displayGrandTotal + displayGst;
  const displayRoundOff = parseFloat(form.watch("estimate_amount_round")) || 0;
  const amountToBeCollected = displayNetTotal + displayRoundOff;

  const formProps = {
    form,
    itemEntries,
    handleItemChange,
    addItemEntry,
    removeItemEntry,
    handleChargeChange,
    handleRoundOffChange,
    handleCancel,
    handleFormSubmit,
    estimateRef,
    handleKeyDown,
    loadingType,
    setLoadingType,
    isSubmitting,
    productOptions,
    customItems,
    isCustomItem,
    handleCustomItemChange,
    handleToggleCustomItem,
    amountToBeCollected,
    displayGrandTotal,
    autoGst18,
    setSaveAction: (action) => { saveActionRef.current = action; },
  };

  return (
    <Page>
      <MobileEstimateForm {...formProps} />
      <DesktopEstimateForm {...formProps} />
    </Page>
  );
};

export default EstimateAddPage;
