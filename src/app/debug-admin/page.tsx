'use client';

import { useState, useEffect } from 'react';
import { ensureAdminProfile, debugUserProfile } from '@/lib/admin-utils';
import { useAuth } from '@/hooks/useAuth';

export default function DebugAdminPage() {
  const { user, userRole, userProfile } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [uid, setUid] = useState<string>('');
  const [email, setEmail] = useState<string>('victoria@aprettygirlmatter.com');
  const [firstName, setFirstName] = useState<string>('Victoria');
  const [lastName, setLastName] = useState<string>('Escobar');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Update UID when user logs in
  useEffect(() => {
    if (user) {
      setUid(user.uid);
      setEmail(user.email || 'victoria@aprettygirlmatter.com');
    }
  }, [user]);
  
  // Console log override to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);
  
  const handleFixAdmin = async () => {
    if (!uid || !email) {
      setMessage('Please enter UID and email');
      return;
    }
    
    setLoading(true);
    setMessage('Fixing admin profile...');
    
    try {
      const adminProfile = await ensureAdminProfile(uid, email, firstName, lastName);
      setMessage(`Admin profile fixed successfully for ${adminProfile.email}`);
    } catch (error) {
      setMessage(`Error fixing admin profile: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDebugProfile = async () => {
    if (!uid) {
      setMessage('Please enter UID');
      return;
    }
    
    setLoading(true);
    setMessage('Debugging user profile...');
    
    try {
      await debugUserProfile(uid);
      setMessage('Profile debugging complete. Check logs below.');
    } catch (error) {
      setMessage(`Error debugging profile: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-5 pt-5">
      <h1 className="mb-4">Admin Debug Tools</h1>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Current User Information</h5>
        </div>
        <div className="card-body">
          <p><strong>Status:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
          {user && (
            <>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Role:</strong> {userRole || 'No Role'}</p>
              <p><strong>Has Profile:</strong> {userProfile ? 'Yes' : 'No'}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Fix Admin Access</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="uid" className="form-label">User UID</label>
            <input
              type="text"
              id="uid"
              className="form-control"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Firebase Auth UID"
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
              />
            </div>
            
            <div className="col">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            <button
              className="btn btn-primary"
              onClick={handleFixAdmin}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Fix Admin Profile'}
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={handleDebugProfile}
              disabled={loading}
            >
              Debug Profile
            </button>
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Debug Logs</h5>
        </div>
        <div className="card-body">
          <div className="bg-light p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {logs.map((log, index) => (
              <div key={index} className={`mb-1 ${log.startsWith('ERROR:') ? 'text-danger' : ''}`}>
                {log}
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted">No logs yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
