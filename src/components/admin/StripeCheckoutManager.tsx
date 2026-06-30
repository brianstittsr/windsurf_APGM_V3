'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { useServices } from '@/hooks/useFirebase';
import {
  CreditCard,
  Users,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Upload,
  Loader2,
  AlertCircle,
  Receipt,
  Smartphone,
  Tag,
  AlertTriangle,
  ExternalLink,
  ArrowRightLeft,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FirebaseClient {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  stripeCustomerId?: string;
  stripeSyncStatus?: 'synced' | 'error' | 'pending';
  stripeTotalSpent?: number;
  stripeTransactionCount?: number;
}

interface TapTransaction {
  paymentIntentId: string;
  firebaseUserId: string;
  stripeCustomerId?: string;
  procedureType: string;
  bookingId?: string;
  amountCents: number;
  amountReceived?: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  paidAt?: { seconds: number };
  createdAt?: { seconds: number };
  notes?: string;
}

interface SyncStatusClient {
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  stripeCustomerId: string | null;
  stripeSyncStatus: string | null;
  stripeLastSyncAt: string | null;
  stripeName?: string;
  stripeEmail?: string;
  nameMismatch?: boolean;
  emailMismatch?: boolean;
  syncState: 'synced' | 'not_synced' | 'mismatch' | 'skipped';
}

interface SyncStatusReport {
  summary: { total: number; synced: number; notSynced: number; mismatch: number; skipped: number };
  clients: SyncStatusClient[];
}

type ActiveView = 'checkout' | 'clients' | 'transactions';

export default function StripeCheckoutManager() {
  const { services } = useServices();

  const [activeView, setActiveView] = useState<ActiveView>('checkout');

  // --- Client state ---
  const [clients, setClients] = useState<FirebaseClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<FirebaseClient[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<FirebaseClient | null>(null);

  // --- Sync state ---
  const [syncReport, setSyncReport] = useState<SyncStatusReport | null>(null);
  const [loadingSyncReport, setLoadingSyncReport] = useState(false);
  const [syncFilter, setSyncFilter] = useState<'all' | 'not_synced' | 'mismatch' | 'synced'>('all');
  const [syncSearch, setSyncSearch] = useState('');
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkSyncLog, setBulkSyncLog] = useState<Array<{ name: string; status: string; detail: string }>>([]);
  const [syncingClientId, setSyncingClientId] = useState<string | null>(null);


  // --- Checkout state ---
  const [procedureType, setProcedureType] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
    stripeCustomerId?: string;
  } | null>(null);
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'succeeded' | 'failed'>('idle');

  // --- Transactions state ---
  const [transactions, setTransactions] = useState<TapTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [syncingHistory, setSyncingHistory] = useState(false);
  const [syncHistoryResult, setSyncHistoryResult] = useState<{
    summary: { usersProcessed: number; totalTransactionsSynced: number; totalRevenueCents: number; errors: number };
  } | null>(null);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const snap = await getDocs(collection(getDb(), 'users'));
      const data = snap.docs
        .map(doc => {
          const d = doc.data();
          const profile = d.profile || {};
          const firstName = profile.firstName || d.firstName || '';
          const lastName = profile.lastName || d.lastName || '';
          return {
            id: doc.id,
            displayName: d.displayName || `${firstName} ${lastName}`.trim() || d.email || doc.id,
            email: d.email || profile.email || '',
            phone: d.phone || profile.phone || '',
            stripeCustomerId: d.stripeCustomerId,
            stripeSyncStatus: d.stripeSyncStatus,
            stripeTotalSpent: d.stripeTotalSpent,
            stripeTransactionCount: d.stripeTransactionCount,
          } as FirebaseClient;
        })
        .filter(c => c.email)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  // Fetch recent tap transactions via server API (Admin SDK bypasses Firestore rules)
  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await fetch('/api/stripe/transactions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  // Fetch sync status report from server (compares Firebase vs Stripe)
  const fetchSyncReport = useCallback(async () => {
    setLoadingSyncReport(true);
    try {
      const res = await fetch('/api/stripe/customers/status');
      if (res.ok) {
        const data = await res.json();
        setSyncReport(data);
      }
    } catch (err) {
      console.error('Error fetching sync report:', err);
    } finally {
      setLoadingSyncReport(false);
    }
  }, []);

  // Sync a single client and refresh the report row
  const handleSyncOneClient = async (client: SyncStatusClient) => {
    setSyncingClientId(client.userId);
    try {
      const res = await fetch('/api/stripe/customers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: client.userId }),
      });
      const data = await res.json();
      if (data.success) {
        // Patch the local report row optimistically
        setSyncReport(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            clients: prev.clients.map(c =>
              c.userId === client.userId
                ? { ...c, stripeCustomerId: data.stripeCustomerId, syncState: 'synced', nameMismatch: false, emailMismatch: false }
                : c
            ),
            summary: {
              ...prev.summary,
              synced: prev.summary.synced + (client.syncState !== 'synced' ? 1 : 0),
              notSynced: Math.max(0, prev.summary.notSynced - (client.syncState === 'not_synced' ? 1 : 0)),
              mismatch: Math.max(0, prev.summary.mismatch - (client.syncState === 'mismatch' ? 1 : 0)),
            },
          };
        });
        // Also refresh the checkout clients list
        fetchClients();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncingClientId(null);
    }
  };

  // Bulk sync: only unsynced + mismatch clients, show live log
  const handleBulkSync = async () => {
    if (!syncReport) return;
    const toSync = syncReport.clients.filter(c => c.syncState !== 'synced' && c.syncState !== 'skipped');
    if (toSync.length === 0) return;

    setBulkSyncing(true);
    setBulkSyncLog([]);

    for (const client of toSync) {
      setBulkSyncLog(prev => [...prev, { name: client.displayName, status: 'syncing', detail: '...' }]);
      try {
        const res = await fetch('/api/stripe/customers/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: client.userId }),
        });
        const data = await res.json();
        if (data.success) {
          setBulkSyncLog(prev => prev.map(l =>
            l.name === client.displayName
              ? { name: client.displayName, status: data.action, detail: data.stripeCustomerId }
              : l
          ));
          setSyncReport(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              clients: prev.clients.map(c =>
                c.userId === client.userId
                  ? { ...c, stripeCustomerId: data.stripeCustomerId, syncState: 'synced', nameMismatch: false, emailMismatch: false }
                  : c
              ),
            };
          });
        } else {
          setBulkSyncLog(prev => prev.map(l =>
            l.name === client.displayName
              ? { name: client.displayName, status: 'error', detail: data.error || 'Failed' }
              : l
          ));
        }
      } catch (err) {
        setBulkSyncLog(prev => prev.map(l =>
          l.name === client.displayName
            ? { name: client.displayName, status: 'error', detail: 'Network error' }
            : l
        ));
      }
    }

    setBulkSyncing(false);
    fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (activeView === 'transactions') fetchTransactions();
    if (activeView === 'clients') fetchSyncReport();
  }, [activeView, fetchTransactions, fetchSyncReport]);

  // Client search filter
  useEffect(() => {
    if (!clientSearch.trim()) {
      setFilteredClients(clients);
    } else {
      const s = clientSearch.toLowerCase();
      setFilteredClients(clients.filter(c =>
        c.displayName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone && c.phone.includes(s))
      ));
    }
  }, [clientSearch, clients]);

  // Poll payment intent status
  useEffect(() => {
    if (!paymentIntent || pollingStatus !== 'polling') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/stripe/checkout/tap?paymentIntentId=${paymentIntent.paymentIntentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'succeeded') {
            setPollingStatus('succeeded');
            clearInterval(interval);
            // Refresh client list to show updated spend
            setTimeout(() => fetchClients(), 2000);
          } else if (['canceled', 'requires_payment_method'].includes(data.status)) {
            setPollingStatus('failed');
            clearInterval(interval);
          }
        }
      } catch {
        // silently retry
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentIntent, pollingStatus, fetchClients]);

  // --- Handlers ---


  const handleCreateTapIntent = async () => {
    if (!selectedClient) return;
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    if (!procedureType) return;

    setCreatingIntent(true);
    setPaymentIntent(null);
    setPollingStatus('idle');

    try {
      const res = await fetch('/api/stripe/checkout/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUserId: selectedClient.id,
          stripeCustomerId: selectedClient.stripeCustomerId,
          amountCents: Math.round(amount * 100),
          procedureType,
          bookingId: bookingId || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.paymentIntentId) {
        setPaymentIntent(data);
        setPollingStatus('polling');
      }
    } catch (err) {
      console.error('Error creating tap intent:', err);
    } finally {
      setCreatingIntent(false);
    }
  };

  const resetCheckout = () => {
    setPaymentIntent(null);
    setPollingStatus('idle');
    setCustomAmount('');
    setProcedureType('');
    setBookingId('');
    setNotes('');
  };

  const syncedCount = clients.filter(c => c.stripeCustomerId).length;
  const totalRevenue = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + (t.amountReceived || t.amountCents) / 100, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#AD6269]" />
            Stripe Tap to Pay Checkout
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Accept card payments via smartphone tap — linked to Firebase client records
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'checkout' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('checkout')}
            className={activeView === 'checkout' ? 'bg-[#AD6269] hover:bg-[#9d5860]' : ''}
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Checkout
          </Button>
          <Button
            variant={activeView === 'clients' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('clients')}
            className={activeView === 'clients' ? 'bg-[#AD6269] hover:bg-[#9d5860]' : ''}
          >
            <Users className="w-4 h-4 mr-1" />
            Clients
          </Button>
          <Button
            variant={activeView === 'transactions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('transactions')}
            className={activeView === 'transactions' ? 'bg-[#AD6269] hover:bg-[#9d5860]' : ''}
          >
            <Receipt className="w-4 h-4 mr-1" />
            Transactions
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'blue' },
          { label: 'Synced to Stripe', value: syncedCount, icon: CheckCircle, color: 'green' },
          { label: 'Tap Transactions', value: transactions.length, icon: Receipt, color: 'purple' },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'rose' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ─── CHECKOUT VIEW ─── */}
      {activeView === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Client picker */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#AD6269]" />
              1. Select Client
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="pl-9 h-10"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1">
              {loadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#AD6269]" />
                </div>
              ) : filteredClients.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No clients found</p>
              ) : (
                filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedClient?.id === client.id
                        ? 'border-[#AD6269] bg-[#AD6269]/5'
                        : 'border-gray-100 hover:border-[#AD6269]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#AD6269]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#AD6269] font-semibold text-sm">
                        {client.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{client.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{client.email}</p>
                    </div>
                    {client.stripeCustomerId ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        Stripe ✓
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
                        Not synced
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Payment form / result */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {/* Selected client banner */}
            {selectedClient && (
              <div className="bg-[#AD6269]/5 border border-[#AD6269]/20 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#AD6269]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedClient.displayName}</p>
                  <p className="text-xs text-gray-500">{selectedClient.email}</p>
                  {selectedClient.stripeCustomerId && (
                    <p className="text-xs text-green-600">Stripe: {selectedClient.stripeCustomerId}</p>
                  )}
                </div>
              </div>
            )}

            {pollingStatus === 'succeeded' ? (
              /* ── Success state ── */
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    ${(paymentIntent!.amount / 100).toFixed(2)} charged to {selectedClient?.displayName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Transaction recorded in Firebase under client profile
                  </p>
                </div>
                <Button onClick={resetCheckout} className="bg-[#AD6269] hover:bg-[#9d5860]">
                  New Checkout
                </Button>
              </div>
            ) : pollingStatus === 'failed' ? (
              /* ── Failed state ── */
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <XCircle className="w-9 h-9 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
                  <p className="text-gray-500 text-sm mt-1">The tap payment was not completed.</p>
                </div>
                <Button onClick={resetCheckout} variant="outline">Try Again</Button>
              </div>
            ) : paymentIntent ? (
              /* ── Waiting for tap ── */
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 animate-pulse">
                  <Smartphone className="w-9 h-9 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Waiting for Tap…</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Present the card or phone to the reader
                  </p>
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Client</span>
                      <span className="font-medium">{selectedClient?.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Procedure</span>
                      <span className="font-medium">{procedureType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-bold text-[#AD6269]">${(paymentIntent.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Payment Intent</span>
                      <span className="text-gray-400 font-mono">{paymentIntent.paymentIntentId.slice(-12)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-500 mt-2 flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking status every 3 seconds…
                  </p>
                </div>
                <Button onClick={resetCheckout} variant="outline" size="sm">Cancel</Button>
              </div>
            ) : (
              /* ── Payment form ── */
              <>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#AD6269]" />
                  2. Procedure & Amount
                </h3>

                {!selectedClient && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">Select a client on the left first</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedure Type *
                    </label>
                    <select
                      value={procedureType}
                      onChange={e => setProcedureType(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] bg-white"
                    >
                      <option value="">Select procedure...</option>
                      {services?.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                      <option value="Touch-Up">Touch-Up</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        min="0.50"
                        step="0.01"
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link to Booking ID (optional)
                    </label>
                    <Input
                      value={bookingId}
                      onChange={e => setBookingId(e.target.value)}
                      placeholder="Firebase booking doc ID"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <Input
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Deposit, balance due, touch-up..."
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateTapIntent}
                  disabled={!selectedClient || !procedureType || !customAmount || creatingIntent}
                  className="w-full h-12 bg-[#AD6269] hover:bg-[#9d5860] text-base font-semibold"
                >
                  {creatingIntent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5 mr-2" />
                      Initiate Tap to Pay — ${customAmount ? parseFloat(customAmount).toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Creates a Stripe Terminal PaymentIntent. Use the Stripe Dashboard or
                  your Stripe Terminal SDK to collect the tap.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── CLIENTS SYNC VIEW ─── */}
      {activeView === 'clients' && (
        <div className="space-y-4">
          {/* Sync Summary Cards */}
          {syncReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Clients', value: syncReport.summary.total, color: 'bg-gray-50 border-gray-200', text: 'text-gray-900' },
                { label: 'Synced ✓', value: syncReport.summary.synced, color: 'bg-green-50 border-green-200', text: 'text-green-700' },
                { label: 'Not Synced', value: syncReport.summary.notSynced, color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
                { label: 'Data Mismatch', value: syncReport.summary.mismatch, color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#AD6269]" />
                <h3 className="font-semibold text-gray-900">Firebase → Stripe Client Sync</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchSyncReport}
                  disabled={loadingSyncReport}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loadingSyncReport ? 'animate-spin' : ''}`} />
                  Check Status
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkSync}
                  disabled={bulkSyncing || loadingSyncReport || !syncReport || (syncReport.summary.notSynced + syncReport.summary.mismatch) === 0}
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                >
                  {bulkSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  {bulkSyncing
                    ? `Syncing…`
                    : `Sync ${syncReport ? syncReport.summary.notSynced + syncReport.summary.mismatch : 0} Clients`}
                </Button>
              </div>
            </div>

            {/* Live bulk sync log */}
            {bulkSyncLog.length > 0 && (
              <div className="mx-5 mt-4 bg-gray-900 rounded-lg p-3 font-mono text-xs max-h-40 overflow-y-auto">
                {bulkSyncLog.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    {entry.status === 'syncing' && <Loader2 className="w-3 h-3 animate-spin text-blue-400 flex-shrink-0" />}
                    {entry.status === 'created' && <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />}
                    {entry.status === 'updated' && <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                    {entry.status === 'error' && <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    <span className={
                      entry.status === 'error' ? 'text-red-300' :
                      entry.status === 'syncing' ? 'text-gray-400' :
                      'text-green-300'
                    }>
                      {entry.name}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className={entry.status === 'error' ? 'text-red-400' : 'text-gray-400'}>
                      {entry.status === 'syncing' ? 'syncing…' : entry.status === 'created' ? `created ${entry.detail}` : entry.status === 'updated' ? `updated ${entry.detail}` : entry.detail}
                    </span>
                  </div>
                ))}
                {bulkSyncing && <div className="text-gray-500 animate-pulse mt-1">● running…</div>}
                {!bulkSyncing && bulkSyncLog.length > 0 && (
                  <div className="text-green-400 mt-1">
                    ✓ Done — {bulkSyncLog.filter(l => l.status !== 'error' && l.status !== 'syncing').length} synced,{' '}
                    {bulkSyncLog.filter(l => l.status === 'error').length} errors
                  </div>
                )}
              </div>
            )}

            {/* Filter + Search bar */}
            <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row gap-3">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                {(['all', 'not_synced', 'mismatch', 'synced'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSyncFilter(f)}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      syncFilter === f
                        ? 'bg-[#AD6269] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'not_synced' ? 'Not Synced' : f === 'mismatch' ? 'Mismatch' : 'Synced'}
                    {f !== 'all' && syncReport && (
                      <span className="ml-1 opacity-70">
                        ({f === 'not_synced' ? syncReport.summary.notSynced : f === 'mismatch' ? syncReport.summary.mismatch : syncReport.summary.synced})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={syncSearch}
                  onChange={e => setSyncSearch(e.target.value)}
                  placeholder="Search clients…"
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Table */}
            {loadingSyncReport ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD6269]" />
                <p className="text-gray-500 text-sm">Comparing Firebase clients with Stripe customers…</p>
              </div>
            ) : !syncReport ? (
              <div className="text-center py-12">
                <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm mb-3">Click "Check Status" to compare Firebase clients with Stripe</p>
                <Button onClick={fetchSyncReport} className="bg-[#AD6269] hover:bg-[#9d5860]" size="sm">
                  Check Status
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 font-medium">Client</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Stripe Customer</th>
                      <th className="px-5 py-3 font-medium text-center">Status</th>
                      <th className="px-5 py-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {syncReport.clients
                      .filter(c => {
                        if (syncFilter !== 'all' && c.syncState !== syncFilter) return false;
                        if (!syncSearch.trim()) return true;
                        const s = syncSearch.toLowerCase();
                        return c.displayName.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
                      })
                      .map(client => (
                        <tr key={client.userId} className={`hover:bg-gray-50 transition-colors ${client.syncState === 'mismatch' ? 'bg-orange-50/40' : ''}`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#AD6269]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#AD6269] font-semibold text-xs">
                                  {client.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 block">{client.displayName}</span>
                                {client.nameMismatch && (
                                  <span className="text-xs text-orange-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Name mismatch: Stripe has "{client.stripeName}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-sm">
                            <span className={client.emailMismatch ? 'text-orange-600 font-medium' : ''}>
                              {client.email || <span className="text-gray-300 italic">no email</span>}
                            </span>
                            {client.emailMismatch && (
                              <span className="block text-xs text-orange-500">Stripe: {client.stripeEmail}</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {client.stripeCustomerId ? (
                              <a
                                href={`https://dashboard.stripe.com/customers/${client.stripeCustomerId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-xs"
                              >
                                {client.stripeCustomerId.slice(0, 18)}…
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {client.syncState === 'synced' && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Synced
                              </span>
                            )}
                            {client.syncState === 'not_synced' && (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> Not synced
                              </span>
                            )}
                            {client.syncState === 'mismatch' && (
                              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Mismatch
                              </span>
                            )}
                            {client.syncState === 'skipped' && (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                                <CircleDot className="w-3 h-3" /> No email
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {client.syncState !== 'skipped' && (
                              <button
                                onClick={() => handleSyncOneClient(client)}
                                disabled={syncingClientId === client.userId}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#AD6269] hover:underline disabled:opacity-50"
                              >
                                {syncingClientId === client.userId ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowRightLeft className="w-3 h-3" />
                                )}
                                {client.syncState === 'synced' ? 'Re-sync' : client.syncState === 'mismatch' ? 'Fix & Sync' : 'Sync'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {syncReport.clients.filter(c => {
                  if (syncFilter !== 'all' && c.syncState !== syncFilter) return false;
                  if (!syncSearch.trim()) return true;
                  const s = syncSearch.toLowerCase();
                  return c.displayName.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
                }).length === 0 && (
                  <p className="text-center text-gray-400 py-8">No clients match this filter</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TRANSACTIONS VIEW ─── */}
      {activeView === 'transactions' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">Tap-to-Pay Transaction History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Payments from Stripe linked to Firebase clients</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fetchTransactions} disabled={loadingTx}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loadingTx ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  setSyncingHistory(true);
                  setSyncHistoryResult(null);
                  try {
                    const res = await fetch('/api/stripe/transactions/sync-history', { method: 'POST' });
                    const data = await res.json();
                    setSyncHistoryResult(data);
                    await fetchTransactions();
                  } catch (err) {
                    console.error('History sync error:', err);
                  } finally {
                    setSyncingHistory(false);
                  }
                }}
                disabled={syncingHistory}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {syncingHistory ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                Sync from Stripe
              </Button>
            </div>
          </div>

          {syncHistoryResult && (
            <div className="mx-5 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800 text-sm mb-2">Stripe History Synced</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-gray-600">Clients checked: <strong>{syncHistoryResult.summary.usersProcessed}</strong></span>
                <span className="text-green-700">Transactions imported: <strong>{syncHistoryResult.summary.totalTransactionsSynced}</strong></span>
                <span className="text-[#AD6269]">Total revenue: <strong>${(syncHistoryResult.summary.totalRevenueCents / 100).toFixed(2)}</strong></span>
                {syncHistoryResult.summary.errors > 0 && (
                  <span className="text-red-600">Errors: <strong>{syncHistoryResult.summary.errors}</strong></span>
                )}
              </div>
            </div>
          )}

          {loadingTx || syncingHistory ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#AD6269]" />
              <p className="text-sm text-gray-500">{syncingHistory ? 'Pulling transactions from Stripe…' : 'Loading…'}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-1">No transactions in Firebase yet</p>
              <p className="text-xs text-gray-400 mb-4">Click "Sync from Stripe" to import existing payment history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Procedure</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-center">Status</th>
                    <th className="px-5 py-3 font-medium">Stripe PI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(tx => {
                    const client = clients.find(c => c.id === tx.firebaseUserId);
                    const ts = tx.paidAt?.seconds || tx.createdAt?.seconds;
                    const dateStr = ts
                      ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';
                    const amount = (tx.amountReceived || tx.amountCents) / 100;

                    return (
                      <tr key={tx.paymentIntentId} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{dateStr}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {client?.displayName || tx.firebaseUserId?.slice(0, 8) + '…' || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-700">{tx.procedureType}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                          ${amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {tx.status === 'succeeded' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Paid
                            </span>
                          ) : tx.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={`https://dashboard.stripe.com/payments/${tx.paymentIntentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-xs"
                          >
                            {tx.paymentIntentId.slice(-12)}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
