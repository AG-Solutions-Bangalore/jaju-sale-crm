import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/loader/Loader";
import { useSales, usePurchases, useDashboard } from "../hooks/useHome";
import { formatCurrency } from "../utils/formatCurrency";
import MetricCard from "../components/MetricCard";
import SalesTable from "../components/SalesTable";
import PurchaseTable from "../components/PurchaseTable";

const SaleDashboardPage = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useDashboard();
  const {
    data: sales = [],
    isLoading: isSalesLoading,
    isError: isSalesError,
    refetch: refetchSales,
  } = useSales();
  const {
    data: purchases = [],
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
    refetch: refetchPurchases,
  } = usePurchases();

  const isLoading = isSalesLoading || isPurchasesLoading || isDashboardLoading;
  const isError = isSalesError || isPurchasesError;

  const handleRefreshAll = () => {
    refetchDashboard();
    refetchSales();
    refetchPurchases();
  };

  const summary = dashboardData?.summary || {};
  const entity = dashboardData?.entity || {};

  const displayedSales = useMemo(() => {
    if (
      Array.isArray(dashboardData?.last_sales) &&
      dashboardData.last_sales.length > 0
    ) {
      return dashboardData.last_sales;
    }
    return sales.slice(0, 5);
  }, [dashboardData, sales]);

  const displayedPurchases = useMemo(() => {
    if (
      Array.isArray(dashboardData?.last_purchase) &&
      dashboardData.last_purchase.length > 0
    ) {
      return dashboardData.last_purchase;
    }
    return purchases.slice(0, 5);
  }, [dashboardData, purchases]);

  const totalSalesAmount = useMemo(() => {
    if (summary.total_sales !== undefined && summary.total_sales !== null) {
      return parseFloat(summary.total_sales) || 0;
    }
    return sales.reduce((sum, item) => {
      const net = parseFloat(
        item.sales_net_total ||
          item.sales_temp_amount ||
          item.sales_amount ||
          0,
      );
      const roundOff = parseFloat(item.sales_amount_round || 0);
      const payable = item.sales_amount_payable
        ? parseFloat(item.sales_amount_payable)
        : net + roundOff;
      return sum + payable;
    }, 0);
  }, [sales, summary]);

  const totalPurchaseAmount = useMemo(() => {
    if (
      summary.total_purchase !== undefined &&
      summary.total_purchase !== null
    ) {
      return parseFloat(summary.total_purchase) || 0;
    }
    return purchases.reduce((sum, item) => {
      const gross = parseFloat(item.purchase_gross);
      if (!isNaN(gross) && gross > 0) return sum + gross;
      const net = parseFloat(item.purchase_net_total);
      if (!isNaN(net) && net > 0) return sum + net;
      const payable = parseFloat(item.purchase_amount_payable);
      if (!isNaN(payable) && payable > 0) return sum + payable;
      const amt = parseFloat(item.purchase_amount);
      if (!isNaN(amt) && amt > 0) return sum + amt;
      const recvd = parseFloat(item.purchase_amount_received);
      if (!isNaN(recvd) && recvd > 0) return sum + recvd;
      return sum;
    }, 0);
  }, [purchases, summary]);

  const netFlow = useMemo(() => {
    if (summary.net_flow !== undefined && summary.net_flow !== null) {
      return parseFloat(summary.net_flow) || 0;
    }
    return totalSalesAmount - totalPurchaseAmount;
  }, [summary, totalSalesAmount, totalPurchaseAmount]);

  const salesCount = entity.sales !== undefined ? entity.sales : sales.length;
  const purchaseCount =
    entity.purchase !== undefined ? entity.purchase : purchases.length;
  const estimateCount = entity.estimate !== undefined ? entity.estimate : 0;

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader />
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              Error Fetching Dashboard Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Could not load the sales or purchase records.
            </p>
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-2 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Real-time overview of sales and purchases
            </p>
          </div>
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Sales"
            value={formatCurrency(totalSalesAmount)}
            icon={TrendingUp}
            iconBg="bg-blue-50 text-blue-600"
            count={salesCount}
            countLabel="Bills"
            onClick={() => navigate("/sales")}
            gradientFrom="from-blue-100/30"
          />
          <MetricCard
            title="Total Purchases"
            value={formatCurrency(totalPurchaseAmount)}
            icon={TrendingDown}
            iconBg="bg-orange-50 text-orange-600"
            count={purchaseCount}
            countLabel="Records"
            onClick={() => navigate("/purchase")}
            gradientFrom="from-orange-100/30"
          />
          <MetricCard
            title="Net Flow"
            value={formatCurrency(netFlow)}
            icon={DollarSign}
            iconBg={
              netFlow >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }
            gradientFrom="from-emerald-100/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTable sales={displayedSales} />
          <PurchaseTable purchases={displayedPurchases} />
        </div>
      </div>
    </Page>
  );
};

export default SaleDashboardPage;
