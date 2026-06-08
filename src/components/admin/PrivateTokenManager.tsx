'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type TokenRotationSource = 'vercel-cron-oauth-refresh' | 'manual-admin-rotation' | string;

interface TokenRotationRecord {
  id: string;
  rotatedAt: string | null;
  expiresAt: string | null;
  source: TokenRotationSource;
  tokenType?: string | null;
  companyId?: string | null;
  locationId?: string | null;
  refreshTokenId?: string | null;
  traceId?: string | null;
  accessTokenLast4?: string | null;
  refreshTokenLast4?: string | null;
}

interface CurrentTokenState {
  exists: boolean;
  lastRotatedAt: string | null;
  expiresAt: string | null;
  tokenSource: TokenRotationSource | null;
  tokenType?: string | null;
  companyId?: string | null;
  locationId?: string | null;
  refreshTokenId?: string | null;
  traceId?: string | null;
}

interface TokenRotationResponse {
  success: boolean;
  current?: CurrentTokenState;
  rotations?: TokenRotationRecord[];
  error?: string;
  message?: string;
  rotation?: TokenRotationRecord;
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function sourceLabel(source?: TokenRotationSource | null) {
  if (source === 'manual-admin-rotation') return 'Manual admin rotation';
  if (source === 'vercel-cron-oauth-refresh') return 'Vercel cron rotation';
  return source || 'Unknown source';
}

function sourceBadgeClass(source?: TokenRotationSource | null) {
  if (source === 'manual-admin-rotation') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (source === 'vercel-cron-oauth-refresh') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

export default function PrivateTokenManager() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<CurrentTokenState | null>(null);
  const [rotations, setRotations] = useState<TokenRotationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getAuthorizationHeaders = async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  };

  const loadRotations = async () => {
    if (!user) {
      setLoading(false);
      setError('Admin authentication is required to manage private tokens.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const headers = await getAuthorizationHeaders();
      const response = await fetch('/api/admin/ghl-token-rotations', { cache: 'no-store', headers });
      const payload = await response.json() as TokenRotationResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to load token rotation history');
      }
      setCurrent(payload.current || null);
      setRotations(payload.rotations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load token rotation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRotations();
  }, [user]);

  const stats = useMemo(() => {
    return rotations.reduce(
      (acc, rotation) => {
        if (rotation.source === 'manual-admin-rotation') acc.manual += 1;
        if (rotation.source === 'vercel-cron-oauth-refresh') acc.cron += 1;
        return acc;
      },
      { manual: 0, cron: 0 },
    );
  }, [rotations]);

  const triggerManualRotation = async () => {
    const confirmed = window.confirm(
      'Rotate the GoHighLevel private token now? This will refresh the OAuth token, update Firestore, log the manual rotation, and send the success notification email.',
    );
    if (!confirmed) return;

    if (!user) {
      setError('Admin authentication is required to rotate private tokens.');
      return;
    }

    setRotating(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/admin/ghl-token-rotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthorizationHeaders()) },
        body: JSON.stringify({ requestedBy: 'admin-dashboard' }),
      });
      const payload = await response.json() as TokenRotationResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Manual token rotation failed');
      }
      setSuccessMessage(payload.message || 'Private token rotated successfully.');
      await loadRotations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Manual token rotation failed');
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <i className="fas fa-key"></i>
                Private Token Management
              </h2>
              <p className="text-slate-200 text-sm mt-1">
                Trigger GoHighLevel private token rotations and audit manual plus cron-triggered activity.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadRotations}
                disabled={loading || rotating}
                className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 disabled:opacity-60"
              >
                Refresh Log
              </button>
              <button
                type="button"
                onClick={triggerManualRotation}
                disabled={rotating}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-60"
              >
                {rotating ? 'Rotating…' : 'Rotate Private Token'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <strong>Token management error:</strong> {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              <strong>Success:</strong> {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Current Token</p>
              <p className="text-2xl font-bold text-gray-900">{current?.exists ? 'Active' : 'Missing'}</p>
              <p className="text-xs text-gray-500 mt-1">No token values are displayed.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Last Rotation</p>
              <p className="text-sm font-semibold text-gray-900 mt-2">{formatDate(current?.lastRotatedAt)}</p>
              <p className="text-xs text-gray-500 mt-1">{sourceLabel(current?.tokenSource)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Manual Rotations</p>
              <p className="text-2xl font-bold text-blue-700">{stats.manual}</p>
              <p className="text-xs text-gray-500 mt-1">Visible in audit log below.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Cron Rotations</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.cron}</p>
              <p className="text-xs text-gray-500 mt-1">Tracked from Vercel cron.</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
            <strong>Security note:</strong> access tokens and refresh tokens are never rendered in this dashboard. The log only shows metadata and last-four fingerprints.
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Rotation Audit Log</h3>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading token rotation history…</div>
            ) : rotations.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                No token rotation history has been recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Rotated At</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Source</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Expires</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Token Fingerprints</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rotations.map((rotation) => (
                      <tr key={rotation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{formatDate(rotation.rotatedAt)}</td>
                        <td className="px-4 py-3">
                          <span className={'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ' + sourceBadgeClass(rotation.source)}>
                            {sourceLabel(rotation.source)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(rotation.expiresAt)}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>Company: {rotation.companyId || 'n/a'}</div>
                          <div>Location: {rotation.locationId || 'n/a'}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>Access: ****{rotation.accessTokenLast4 || 'n/a'}</div>
                          <div>Refresh: ****{rotation.refreshTokenLast4 || 'n/a'}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={rotation.traceId || undefined}>
                          {rotation.traceId || rotation.refreshTokenId || 'n/a'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
