'use client';

import { useState } from 'react';
import { initializeDatabase } from '@/scripts/initializeDatabase';
import { createExampleAdminUser } from '@/scripts/createAdminUser';

export default function DatabaseSetup() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initResults, setInitResults] = useState<string[]>([]);

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      setInitResults([]);
      
      // Initialize database with services and settings
      setInitResults(prev => [...prev, '✅ Initializing database with services and settings...']);
      await initializeDatabase();
      setInitResults(prev => [...prev, '✅ Database initialized successfully']);
      
      // Create admin@example.com user
      setInitResults(prev => [...prev, '✅ Creating admin@example.com user...']);
      await createExampleAdminUser();
      setInitResults(prev => [...prev, '✅ Admin user created successfully']);
      
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitialized) {
    return (
      <div className="alert alert-success">
        <h4 className="alert-heading">Database Initialized Successfully!</h4>
        <p>Your Firebase database has been set up with default services, settings, and admin users.</p>
        <div className="mt-3">
          <h6>Initialization Results:</h6>
          <ul className="list-unstyled">
            {initResults.map((result, index) => (
              <li key={index} className="text-success">
                <small>{result}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 p-3 bg-light rounded">
          <h6>Admin Login Credentials:</h6>
          <p className="mb-1"><strong>Email:</strong> admin@example.com</p>
          <p className="mb-0"><strong>Password:</strong> admin123 (development bypass)</p>
          <small className="text-muted">
            You can now log in with these credentials to access the admin dashboard.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Database Setup</h3>
      </div>
      <div className="card-body">
        <p>Initialize your Firebase database with default services, business settings, and admin users.</p>
        
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {initResults.length > 0 && (
          <div className="alert alert-info">
            <h6>Progress:</h6>
            <ul className="list-unstyled mb-0">
              {initResults.map((result, index) => (
                <li key={index} className="text-info">
                  <small>{result}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          className="btn btn-primary"
          onClick={handleInitialize}
          disabled={isInitializing}
        >
          {isInitializing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Initializing...
            </>
          ) : (
            'Initialize Database'
          )}
        </button>
        
        <div className="mt-3">
          <small className="text-muted">
            This will create:
            <ul className="mt-2">
              <li>6 default eyebrow services with pricing</li>
              <li>Business settings and policies</li>
              <li>Time slots for appointments</li>
              <li>Health questionnaire structure</li>
              <li><strong>Admin user: admin@example.com</strong></li>
            </ul>
          </small>
        </div>
      </div>
    </div>
  );
}
