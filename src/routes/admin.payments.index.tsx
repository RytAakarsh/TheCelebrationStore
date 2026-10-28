import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Receipt,
  Eye,
  Sparkles,
} from "lucide-react";
import { AdminPage, AdminLoading } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { inr, formatDate } from "@/lib/format";
import {
  getAdminPaymentTransactions,
  adminReconcileTransaction,
  adminRefundPayment,
} from "@/lib/payu.functions";

export const Route = createFileRoute("/admin/payments/")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const qc = useQueryClient();
  const fetchTransactions = useServerFn(getAdminPaymentTransactions);
  const reconcileTx = useServerFn(adminReconcileTransaction);
  const refundTx = useServerFn(adminRefundPayment);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [refundDialogTx, setRefundDialogTx] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin_payments", page, search, statusFilter],
    queryFn: () =>
      fetchTransactions({
        data: {
          page,
          pageSize: 20,
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      }),
  });

  const transactions = data?.transactions ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Compute metrics from current transactions
  const totalVolume = transactions
    .filter((t: any) => t.status === "paid" || t.status === "success")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const successCount = transactions.filter((t: any) => t.status === "paid" || t.status === "success").length;
  const pendingCount = transactions.filter((t: any) => t.status === "pending" || t.status === "initiated").length;
  const failedCount = transactions.filter((t: any) => t.status === "failed" || t.status === "cancelled").length;

  async function handleReconcile(txnid: string) {
    setReconcilingId(txnid);
    try {
      const res = await reconcileTx({ data: { txnid } });
      toast.success(`PayU Reconciliation: ${res.message} (Status: ${res.status})`);
      qc.invalidateQueries({ queryKey: ["admin_payments"] });
      qc.invalidateQueries({ queryKey: ["admin_orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reconcile with PayU.");
    } finally {
      setReconcilingId(null);
    }
  }

  async function handleRefund() {
    if (!refundDialogTx) return;
    const num = parseFloat(refundAmount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid refund amount.");
      return;
    }

    setRefunding(true);
    try {
      const res = await refundTx({
        data: {
          txnid: refundDialogTx.txnid,
          payuPaymentId: refundDialogTx.payuPaymentId || refundDialogTx.payment_ref,
          amount: num,
        },
      });
      toast.success(res.message || "Refund submitted to PayU successfully.");
      setRefundDialogTx(null);
      qc.invalidateQueries({ queryKey: ["admin_payments"] });
      qc.invalidateQueries({ queryKey: ["admin_orders"] });
    } catch (err: any) {
      toast.error(err.message || "Refund failed. Please check PayU merchant dashboard.");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <AdminPage
      title="Payment Transactions"
      description="Monitor live PayU payments, verify transaction statuses, and manage customer refunds."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetch();
            toast.success("Transactions refreshed");
          }}
          disabled={isFetching}
          className="rounded-xl text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Captured Volume</span>
              <IndianRupee className="h-4 w-4 text-pink" />
            </div>
            <p className="font-display text-2xl font-bold text-ink mt-2">{inr(totalVolume)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">From verified PayU online orders</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Successful Payments</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-display text-2xl font-bold text-emerald-600 mt-2">{successCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Paid &amp; verified via PayU</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Pending / Initiated</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="font-display text-2xl font-bold text-amber-600 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting customer authorization</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Failed / Cancelled</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="font-display text-2xl font-bold text-red-600 mt-2">{failedCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Cart retained for customer retry</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-2xl border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search txnid, order #, or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-ink focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid / Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed / Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {isLoading ? (
            <AdminLoading />
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-display text-base font-bold text-ink">No Payment Transactions Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When customers check out using PayU (UPI, Cards, Net Banking), transaction records and reconciliation logs will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">PayU Txn ID</th>
                    <th className="py-3 px-4">PayU Payment ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Environment</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {transactions.map((tx: any) => {
                    const isSuccess = tx.status === "paid" || tx.status === "success";
                    const isFailed = tx.status === "failed" || tx.status === "cancelled";
                    const isPending = !isSuccess && !isFailed && tx.status !== "refunded";
                    const isRefunded = tx.status === "refunded";

                    return (
                      <tr key={tx.id || tx.txnid} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-ink">
                          {tx.orderId ? (
                            <Link
                              to="/admin/orders/$id"
                              params={{ id: tx.orderId }}
                              className="text-pink hover:underline flex items-center gap-1"
                            >
                              <span>#{tx.orderNumber || tx.orderId.slice(0, 8)}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span>#{tx.orderNumber || "—"}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-ink select-all">
                          {tx.txnid || "—"}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-muted-foreground select-all">
                          {tx.payuPaymentId || tx.payment_ref || "—"}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-ink">
                          {inr(Number(tx.amount || 0))}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? "bg-emerald-100 text-emerald-800"
                                : isFailed
                                ? "bg-red-100 text-red-800"
                                : isRefunded
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {tx.status?.toUpperCase() || "PENDING"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground">
                          <span className="uppercase text-[10px] bg-secondary px-2 py-0.5 rounded font-mono">
                            {tx.env || "TEST"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.createdAt || tx.created_at)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reconcile button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconcile(tx.txnid)}
                              disabled={reconcilingId === tx.txnid}
                              title="Verify live status with PayU API"
                              className="h-7 text-xs px-2 text-ink hover:text-pink"
                            >
                              <RefreshCw
                                className={`h-3 w-3 mr-1 ${
                                  reconcilingId === tx.txnid ? "animate-spin text-pink" : ""
                                }`}
                              />
                              <span>Verify</span>
                            </Button>

                            {/* Refund button for paid txns */}
                            {isSuccess && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRefundDialogTx(tx);
                                  setRefundAmount(String(tx.amount || ""));
                                }}
                                className="h-7 text-xs px-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                <span>Refund</span>
                              </Button>
                            )}

                            {/* Inspect Raw Response */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTx(tx)}
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-ink"
                              title="Inspect Gateway Payload"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspect Payload Modal */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gold" />
              <span>Payment Transaction Details</span>
            </DialogTitle>
            <DialogDescription>
              Inspection of PayU transaction identifiers, verify_payment payload, and server response.
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-3 rounded-xl">
                <div>
                  <span className="text-muted-foreground">Order #</span>
                  <p className="font-bold text-ink">#{selectedTx.orderNumber || selectedTx.orderId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Txn ID</span>
                  <p className="font-mono text-ink">{selectedTx.txnid}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PayU ID</span>
                  <p className="font-mono text-ink">{selectedTx.payuPaymentId || selectedTx.payment_ref || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-bold text-pink">{inr(Number(selectedTx.amount || 0))}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-ink">Gateway Raw Response (Sanitized):</span>
                <pre className="mt-1.5 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(selectedTx.rawResponse || selectedTx.raw_response || selectedTx, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Modal */}
      <Dialog open={!!refundDialogTx} onOpenChange={() => setRefundDialogTx(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              <span>Issue Customer Refund</span>
            </DialogTitle>
            <DialogDescription>
              This will request a refund directly via PayU API. Ensure your PayU merchant balance has sufficient funds.
            </DialogDescription>
          </DialogHeader>

          {refundDialogTx && (
            <div className="space-y-3 text-xs">
              <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
                <p>
                  <strong>Txn ID:</strong> {refundDialogTx.txnid}
                </p>
                <p>
                  <strong>PayU Payment ID:</strong> {refundDialogTx.payuPaymentId || refundDialogTx.payment_ref}
                </p>
                <p>
                  <strong>Original Order Amount:</strong> {inr(Number(refundDialogTx.amount || 0))}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">Refund Amount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  max={refundDialogTx.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefundDialogTx(null)} disabled={refunding}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRefund}
              disabled={refunding}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {refunding ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing Refund...</span>
                </span>
              ) : (
                <span>Confirm &amp; Refund via PayU</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
