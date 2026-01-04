'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle, Clock, CloudOff, Loader2, X, Eye, Calendar, User, Mail, Phone } from 'lucide-react';

interface SyncStatus {
  bookings: {
    total: number;
    synced: number;
    unsynced: number;
    failed: number;
  };
  appointments: {
    total: number;
    synced: number;
    unsynced: number;
    failed: number;
  };
  totalUnsynced: number;
  totalFailed: number;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  skipped: number;
  skippedPastDates: number;
  message: string;
}

interface FailedAppointment {
  id: string;
  collection: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceName?: string;
  date: string;
  time?: string;
  error: string;
  retryCount?: number;
  lastRetry?: string;
}

export default function GHLSyncStatus() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedAppointments, setFailedAppointments] = useState<FailedAppointment[]>([]);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [localStorageBookings, setLocalStorageBookings] = useState<any[]>([]);
  const [markingPast, setMarkingPast] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sync-all-to-ghl');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFailedAppointments = async () => {
    setLoadingFailed(true);
    try {
      const response = await fetch('/api/admin/failed-syncs');
      if (response.ok) {
        const data = await response.json();
        setFailedAppointments(data.failed || []);
      }
    } catch (error) {
      console.error('Error fetching failed appointments:', error);
    } finally {
      setLoadingFailed(false);
    }
  };

  const viewFailedAppointments = () => {
    setShowFailedModal(true);
    fetchFailedAppointments();
  };

  const retrySync = async (id: string, collection: string) => {
    try {
      const response = await fetch('/api/admin/retry-single-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, collection })
      });
      
      if (response.ok) {
        // Refresh the failed list
        await fetchFailedAppointments();
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error retrying sync:', error);
    }
  };

  const markPastAsSkipped = async () => {
    setMarkingPast(true);
    try {
      const response = await fetch('/api/admin/migrate-local-bookings');
      if (response.ok) {
        const result = await response.json();
        await fetchStatus();
        await fetchFailedAppointments();
        alert(`Marked ${result.markedAsPastDate} past appointments as skipped`);
      }
    } catch (error) {
      console.error('Error marking past appointments:', error);
    } finally {
      setMarkingPast(false);
    }
  };

  const scanLocalStorage = () => {
    if (typeof window === 'undefined') return;
    
    const bookings: any[] = [];
    const bookingKeys = [
      'booking_form_main',
      'booking_form_calendar',
      'booking_form_profile',
      'booking_form_health',
      'booking_form_checkout',
      'bookingFormData',
      'pendingBooking'
    ];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('booking') || key.includes('appointment'))) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            if (parsed.data || parsed.clientName || parsed.serviceName) {
              bookings.push({
                key,
                data: parsed.data || parsed,
                timestamp: parsed.timestamp
              });
            }
          }
        } catch (e) {
          // Not JSON, skip
        }
      }
    }
    
    setLocalStorageBookings(bookings);
    return bookings;
  };

  // Scan localStorage on mount
  useEffect(() => {
    scanLocalStorage();
  }, []);

  const runSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/cron/sync-ghl');
      if (response.ok) {
        const result = await response.json();
        setSyncResult(result);
        setLastSync(new Date().toLocaleTimeString());
        // Refresh status after sync
        await fetchStatus();
      } else {
        const error = await response.json();
        setSyncResult({
          success: false,
          synced: 0,
          failed: 0,
          skipped: 0,
          skippedPastDates: 0,
          message: error.error || 'Sync failed'
        });
      }
    } catch (error) {
      console.error('Error running sync:', error);
      setSyncResult({
        success: false,
        synced: 0,
        failed: 0,
        skipped: 0,
        skippedPastDates: 0,
        message: error instanceof Error ? error.message : 'Sync failed'
      });
    } finally {
      setSyncing(false);
    }
  };

  const runFullSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/admin/sync-all-to-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceResync: false })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSyncResult({
          success: result.success,
          synced: result.summary.synced,
          failed: result.summary.failed,
          skipped: result.summary.skipped,
          skippedPastDates: 0,
          message: result.message
        });
        setLastSync(new Date().toLocaleTimeString());
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error running full sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-sync every 15 minutes if enabled
  useEffect(() => {
    if (!autoSyncEnabled) return;
    
    const interval = setInterval(() => {
      if (!syncing) {
        runSync();
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncing]);

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSynced = (status?.bookings.synced || 0) + (status?.appointments.synced || 0);
  const totalRecords = (status?.bookings.total || 0) + (status?.appointments.total || 0);
  const syncPercentage = totalRecords > 0 ? Math.round((totalSynced / totalRecords) * 100) : 100;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            GHL Sync Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-sync
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Sync Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sync Progress</span>
            <span className="font-medium text-gray-900">{syncPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                syncPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${syncPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Synced</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalSynced}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{status?.totalUnsynced || 0}</p>
          </div>
          
          <div 
            className="bg-red-50 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={viewFailedAppointments}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Failed</span>
              {(status?.totalFailed || 0) > 0 && (
                <Eye className="h-3 w-3 text-red-400 ml-auto" />
              )}
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{status?.totalFailed || 0}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-600 mt-1">{totalRecords}</p>
          </div>
        </div>

        {/* Collection Breakdown */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Bookings:</span>
            <span>{status?.bookings.synced || 0}/{status?.bookings.total || 0} synced</span>
          </div>
          <div className="flex justify-between">
            <span>Appointments:</span>
            <span>{status?.appointments.synced || 0}/{status?.appointments.total || 0} synced</span>
          </div>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className={`p-3 rounded-lg text-sm ${
            syncResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {syncResult.message}
          </div>
        )}

        {/* Last Sync Time */}
        {lastSync && (
          <p className="text-xs text-gray-400 text-center">
            Last sync: {lastSync}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runSync}
            disabled={syncing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          
          <Button
            onClick={runFullSync}
            disabled={syncing}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Full Sync
          </Button>
        </div>

        {/* Mark Past as Skipped Button */}
        {(status?.totalFailed || 0) > 0 && (
          <Button
            onClick={markPastAsSkipped}
            disabled={markingPast}
            variant="outline"
            size="sm"
            className="w-full text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            {markingPast ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            Mark Past Dates as Skipped
          </Button>
        )}

        <p className="text-xs text-gray-400 text-center">
          Auto-sync runs every 15 minutes when enabled
        </p>
      </CardContent>

      {/* Failed Appointments Modal */}
      {showFailedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-red-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Failed Sync Appointments
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFailedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loadingFailed ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : failedAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                  <p>No failed appointments!</p>
                  <p className="text-sm">All appointments are synced with GHL.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {failedAppointments.map((apt) => (
                    <div 
                      key={`${apt.collection}-${apt.id}`}
                      className="border border-red-200 rounded-lg p-4 bg-red-50/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{apt.clientName}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                              {apt.collection}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{apt.date} {apt.time && `at ${apt.time}`}</span>
                            </div>
                            {apt.serviceName && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Service:</span>
                                <span>{apt.serviceName}</span>
                              </div>
                            )}
                            {apt.clientEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{apt.clientEmail}</span>
                              </div>
                            )}
                            {apt.clientPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{apt.clientPhone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-red-600 bg-red-100 rounded px-2 py-1 inline-block">
                            Error: {apt.error}
                          </div>
                          
                          {apt.retryCount && apt.retryCount > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              Retry attempts: {apt.retryCount}
                              {apt.lastRetry && ` • Last: ${new Date(apt.lastRetry).toLocaleString()}`}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retrySync(apt.id, apt.collection)}
                          className="ml-2 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500">
                {failedAppointments.length} failed appointment{failedAppointments.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFailedModal(false)}
                >
                  Close
                </Button>
                {failedAppointments.length > 0 && (
                  <Button
                    onClick={async () => {
                      setSyncing(true);
                      await fetch('/api/admin/retry-failed-syncs', { method: 'POST' });
                      await fetchFailedAppointments();
                      await fetchStatus();
                      setSyncing(false);
                    }}
                    disabled={syncing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Retry All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
