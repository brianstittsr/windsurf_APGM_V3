'use client';

import { useState } from 'react';

export default function TestGHLKeyPage() {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/crm/diagnose-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to test API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">
                <i className="fas fa-stethoscope me-2"></i>
                GoHighLevel API Key Diagnostic Tool
              </h2>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>What This Tool Does:</strong>
                <ul className="mb-0 mt-2">
                  <li>Checks your API key format</li>
                  <li>Tests connection to GoHighLevel</li>
                  <li>Provides detailed error analysis</li>
                  <li>Gives specific recommendations</li>
                </ul>
              </div>

              <div className="mb-4">
                <label htmlFor="apiKey" className="form-label fw-bold">
                  GoHighLevel Private Integration API Key:
                </label>
                <textarea
                  id="apiKey"
                  className="form-control font-monospace"
                  rows={3}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  disabled={testing}
                />
                <small className="text-muted">
                  Your API key is not stored and only used for testing.
                </small>
              </div>

              <button
                className="btn btn-primary btn-lg w-100"
                onClick={handleTest}
                disabled={testing || !apiKey.trim()}
              >
                {testing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play me-2"></i>
                    Run Diagnostic Test
                  </>
                )}
              </button>

              {result && (
                <div className="mt-4">
                  <h4 className="mb-3">
                    {result.success ? (
                      <span className="text-success">
                        <i className="fas fa-check-circle me-2"></i>
                        Success!
                      </span>
                    ) : (
                      <span className="text-danger">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Issues Found
                      </span>
                    )}
                  </h4>

                  {/* Diagnostics */}
                  {result.diagnostics && (
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <strong>API Key Diagnostics</strong>
                      </div>
                      <div className="card-body">
                        <table className="table table-sm mb-0">
                          <tbody>
                            <tr>
                              <td className="fw-bold">Key Provided:</td>
                              <td>{result.diagnostics.keyProvided ? '✅ Yes' : '❌ No'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Key Length:</td>
                              <td>{result.diagnostics.keyLength} characters</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">First Characters:</td>
                              <td className="font-monospace">{result.diagnostics.keyFirstChars}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Last Characters:</td>
                              <td className="font-monospace">{result.diagnostics.keyLastChars}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Has Spaces:</td>
                              <td>{result.diagnostics.hasSpaces ? '⚠️ Yes (Problem!)' : '✅ No'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Has Newlines:</td>
                              <td>{result.diagnostics.hasNewlines ? '⚠️ Yes (Problem!)' : '✅ No'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {result.success && (
                    <div className="alert alert-success">
                      <h5 className="alert-heading">
                        <i className="fas fa-check-circle me-2"></i>
                        {result.message}
                      </h5>
                      {result.locationCount !== undefined && (
                        <p className="mb-2">
                          <strong>Locations Found:</strong> {result.locationCount}
                        </p>
                      )}
                      {result.locations && result.locations.length > 0 && (
                        <div>
                          <strong>Sample Locations:</strong>
                          <ul className="mb-0">
                            {result.locations.map((loc: any) => (
                              <li key={loc.id}>
                                {loc.name} <small className="text-muted">({loc.id})</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Analysis */}
                  {result.errorAnalysis && (
                    <div className="card mb-3 border-danger">
                      <div className="card-header bg-danger text-white">
                        <strong>Error Analysis</strong>
                      </div>
                      <div className="card-body">
                        <p><strong>Status:</strong> {result.errorAnalysis.status} - {result.errorAnalysis.statusText}</p>
                        
                        {result.errorAnalysis.possibleIssues && result.errorAnalysis.possibleIssues.length > 0 && (
                          <div className="mt-3">
                            <strong>Possible Issues:</strong>
                            <ul>
                              {result.errorAnalysis.possibleIssues.map((issue: string, idx: number) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.errorAnalysis.responseBody && (
                          <div className="mt-3">
                            <strong>Response from GoHighLevel:</strong>
                            <pre className="bg-light p-2 rounded mt-2">
                              {JSON.stringify(result.errorAnalysis.responseBody, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && (
                    <div className="card border-warning">
                      <div className="card-header bg-warning">
                        <strong>
                          <i className="fas fa-lightbulb me-2"></i>
                          Recommendations
                        </strong>
                      </div>
                      <div className="card-body">
                        <ol className="mb-0">
                          {result.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Generic Error */}
                  {result.error && !result.errorAnalysis && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {result.error}
                      {result.details && (
                        <div className="mt-2">
                          <small>{result.details}</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-question-circle me-2"></i>
                  How to Get Your API Key
                </h5>
                <ol>
                  <li>Go to <a href="https://app.gohighlevel.com/" target="_blank" rel="noopener noreferrer">GoHighLevel</a></li>
                  <li>Click <strong>Settings</strong> (gear icon, bottom left)</li>
                  <li>Navigate to <strong>Integrations → Private Integrations</strong></li>
                  <li>Click on your integration or create a new one</li>
                  <li>Enable ALL required scopes (especially <code>locations.readonly</code>)</li>
                  <li>Click <strong>"Regenerate API Key"</strong></li>
                  <li>Copy the entire key and paste it above</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
