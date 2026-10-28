import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopLayout, PageHeader } from "@/components/shop/ShopLayout";
import { inr } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import { retryPayuPayment, getPaymentResultStatus } from "@/lib/payu.functions";

type SearchParams = {
  orderId?: string;
  orderNumber?: string;
  status?: string;
  txnid?: string;
  paymentId?: string;
  amount?: string;
  error?: string;
};

export const Route = createFileRoute("/checkout/payment-result")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
    orderNumber: typeof search.orderNumber === "string" ? search.orderNumber : undefined,
    status: typeof search.status === "string" ? search.status : "pending",
    txnid: typeof search.txnid === "string" ? search.txnid : undefined,
    paymentId: typeof search.paymentId === "string" ? search.paymentId : undefined,
    amount: typeof search.amount === "string" ? search.amount : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Payment Status — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentResultPage,
});

function PaymentResultPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const retryPayment = useServerFn(retryPayuPayment);
  const checkStatus = useServerFn(getPaymentResultStatus);

  const [currentStatus, setCurrentStatus] = useState<string>(search.status || "pending");
  const [retrying, setRetrying] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Invalidate cart & orders in background on mount
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  }, [qc]);

  // Polling for pending payments
  useEffect(() => {
    if (currentStatus !== "pending" || !search.orderId || pollCount >= 6) return;

    const timer = setTimeout(async () => {
      try {
        const res = await checkStatus({ data: { orderId: search.orderId! } });
        if (res.status === "paid") {
          setCurrentStatus("paid");
          qc.invalidateQueries({ queryKey: ["cart"] });
          qc.invalidateQueries({ queryKey: ["orders"] });
        } else if (res.status === "failed") {
          setCurrentStatus("failed");
        } else {
          setPollCount((c) => c + 1);
        }
      } catch (err) {
        setPollCount((c) => c + 1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStatus, search.orderId, pollCount, checkStatus, qc]);

  async function handleRetry() {
    if (!search.orderId) {
      navigate({ to: "/checkout" });
      return;
    }

    setRetrying(true);
    try {
      const checkoutResult = await retryPayment({
        data: {
          orderId: search.orderId,
          origin: window.location.origin,
        },
      });

      // Submit form directly to PayU
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = checkoutResult.actionUrl;
      formEl.style.display = "none";

      Object.entries(checkoutResult.payuParams).forEach(([key, val]) => {
        const inputEl = document.createElement("input");
        inputEl.type = "hidden";
        inputEl.name = key;
        inputEl.value = val;
        formEl.appendChild(inputEl);
      });

      document.body.appendChild(formEl);
      formEl.submit();
    } catch (err: any) {
      toast.error(err.message || "Could not restart payment. Please retry from checkout.");
      setRetrying(false);
    }
  }

  const isSuccess = currentStatus === "paid" || currentStatus === "success";
  const isFailed = currentStatus === "failed" || currentStatus === "cancelled";
  const isPending = !isSuccess && !isFailed;
  const numAmount = search.amount ? parseFloat(search.amount) : undefined;

  return (
    <ShopLayout>
      <PageHeader
        title={isSuccess ? "Payment Successful!" : isFailed ? "Payment Incomplete" : "Verifying Payment..."}
        subtitle={
          isSuccess
            ? "Your celebration order has been confirmed."
            : isFailed
            ? "We could not complete your online transaction."
            : "Please wait while we confirm your payment with PayU."
        }
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Checkout", to: "/checkout" },
          { label: "Payment Status" },
        ]}
      />

      <div className="container-page max-w-2xl py-10">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSuccess ? (
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-600/10 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <Sparkles className="h-6 w-6 text-gold absolute -top-1 -right-1 animate-pulse" />
              </div>
            ) : isFailed ? (
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-lg shadow-red-600/10">
                <XCircle className="h-10 w-10" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-600/10 animate-spin">
                <Clock className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {isSuccess && "Celebration Order Confirmed! 🎉"}
              {isFailed && "Payment Was Not Completed"}
              {isPending && "Verifying With PayU..."}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isSuccess &&
                "Thank you for ordering with The Celebration Store. Your payment has been received and verified securely."}
              {isFailed &&
                (search.error ||
                  "The transaction was declined, cancelled, or interrupted. Don't worry, your cart items are still saved!")}
              {isPending &&
                "Confirming payment status with PayU. This usually takes just a few seconds. Please do not refresh."}
            </p>
          </div>

          {/* Transaction Metadata Card */}
          {(search.orderNumber || search.txnid || numAmount !== undefined) && (
            <div className="rounded-2xl bg-secondary/50 p-4 sm:p-6 text-left border border-border space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between font-semibold border-b border-border/60 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-gold" />
                  <span>Order Reference</span>
                </span>
                <span className="font-mono text-ink font-bold">
                  {search.orderNumber ? `#${search.orderNumber}` : "Pending"}
                </span>
              </div>

              {numAmount !== undefined && !isNaN(numAmount) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Payable</span>
                  <span className="font-bold text-pink text-base">{inr(numAmount)}</span>
                </div>
              )}

              {search.txnid && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-ink">{search.txnid}</span>
                </div>
              )}

              {search.paymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">PayU Payment ID</span>
                  <span className="font-mono text-ink">{search.paymentId}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Gateway</span>
                <span className="font-semibold text-ink">PayU India Hosted Checkout</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isSuccess
                      ? "bg-emerald-100 text-emerald-800"
                      : isFailed
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isSuccess ? "PAID & VERIFIED" : isFailed ? "FAILED / CANCELLED" : "PENDING VERIFICATION"}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold px-8 shadow-pink h-11"
                >
                  <Link to="/account/orders">
                    <span>View My Orders</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full font-bold px-8 h-11">
                  <Link to="/shop">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>Continue Shopping</span>
                  </Link>
                </Button>
              </div>
            )}

            {isFailed && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="rounded-full bg-pink text-white hover:bg-pink/90 font-bold px-8 shadow-pink h-11"
                  >
                    {retrying ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>Re-opening PayU...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>Retry Online Payment</span>
                      </span>
                    )}
                  </Button>
                  <Button asChild variant="outline" className="rounded-full font-bold px-8 h-11">
                    <Link to="/checkout">
                      <span>Change to Cash on Delivery</span>
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If any money was debited from your account or UPI wallet, PayU will automatically reverse it within 3-5 business days.
                </p>
              </div>
            )}

            {isPending && (
              <div className="flex justify-center">
                <Button asChild variant="outline" className="rounded-full font-bold px-8 h-11">
                  <Link to="/account/orders">
                    <span>Check Order Status in Account</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Customer Support Footer */}
          <div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Buyer Protection &amp; Safe Transactions</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:8019926065"
                className="hover:text-pink transition flex items-center gap-1 font-semibold text-ink"
              >
                <Phone className="h-3.5 w-3.5 text-gold" />
                <span>8019926065</span>
              </a>
              <a
                href="mailto:thecelebrationstore@gmail.com"
                className="hover:text-pink transition flex items-center gap-1 font-semibold text-ink"
              >
                <Mail className="h-3.5 w-3.5 text-gold" />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
