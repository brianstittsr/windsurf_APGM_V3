'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/services/database';

interface CRMSettings {
  id?: string;
  apiKey: string;
  isEnabled: boolean;
  lastSync?: string;
  syncedContacts: number;
  syncedWorkflows: number;
  errors: string[];
}

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export default function GoHighLevelMCP() {
  const [settings, setSettings] = useState<CRMSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [resourceContent, setResourceContent] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await DatabaseService.getAll<CRMSettings>('crmSettings');
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
        await initializeMCPServer(settingsData[0].apiKey);
      }
    } catch (error) {
      console.error('Error loading CRM settings:', error);
      setMessage({ type: 'error', text: 'Failed to load GoHighLevel settings' });
    } finally {
      setLoading(false);
    }
  };

  const initializeMCPServer = async (apiKey: string) => {
    try {
      // Initialize MCP server connection
      const response = await fetch('/api/crm/mcp/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
        setTools(data.tools || []);
        setMessage({ type: 'success', text: 'MCP Server initialized successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize MCP Server' });
      }
    } catch (error) {
      console.error('Error initializing MCP:', error);
      setMessage({ type: 'error', text: 'Error connecting to MCP Server' });
    }
  };

  const loadResource = async (uri: string) => {
    try {
      const response = await fetch('/api/crm/mcp/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri })
      });

      if (response.ok) {
        const data = await response.json();
        setResourceContent(data);
        setSelectedResource(uri);
      } else {
        setMessage({ type: 'error', text: 'Failed to load resource' });
      }
    } catch (error) {
      console.error('Error loading resource:', error);
      setMessage({ type: 'error', text: 'Error loading resource' });
    }
  };

  const executeTool = async (toolName: string, args: any) => {
    try {
      const response = await fetch('/api/crm/mcp/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, args })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Tool ${toolName} executed successfully` });
        return data;
      } else {
        setMessage({ type: 'error', text: `Failed to execute tool ${toolName}` });
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      setMessage({ type: 'error', text: 'Error executing tool' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading GoHighLevel MCP Server...</p>
      </div>
    );
  }

  if (!settings || !settings.apiKey) {
    return (
      <div className="alert alert-warning">
        <h5><i className="fas fa-exclamation-triangle me-2"></i>API Key Required</h5>
        <p>Please configure your GoHighLevel API key in the main GoHighLevel tab first.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white p-4">
              <h2 className="card-title mb-2 fw-bold">
                <i className="fas fa-server me-3"></i>
                GoHighLevel MCP Server
              </h2>
              <p className="card-text mb-0 opacity-75">
                Access GoHighLevel via Model Context Protocol (MCP) Server
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MCP Architecture Diagram */}
      <div className="card mb-4 border-info">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0"><i className="fas fa-network-wired me-2"></i>MCP Server Architecture</h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="p-3 border rounded bg-light">
                <i className="fas fa-desktop fa-2x text-primary mb-2"></i>
                <h6>Your Application</h6>
                <small>BMAD Orchestrator</small>
              </div>
            </div>
            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <i className="fas fa-arrow-right fa-2x text-muted"></i>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-info text-white">
                <i className="fas fa-server fa-2x mb-2"></i>
                <h6>MCP Server</h6>
                <small>Protocol Layer</small>
              </div>
            </div>
            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <i className="fas fa-exchange-alt fa-2x text-muted"></i>
            </div>
            <div className="col-md-3">
              <div className="p-3 border rounded bg-success text-white">
                <i className="fas fa-cloud fa-2x mb-2"></i>
                <h6>GoHighLevel API</h6>
                <small>CRM Backend</small>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <h6 className="text-info">MCP Server Benefits:</h6>
            <ul className="small">
              <li><strong>Standardized Protocol:</strong> Uses Model Context Protocol for consistent API access</li>
              <li><strong>Resource-Based:</strong> Access GHL data as structured resources</li>
              <li><strong>Tool Execution:</strong> Execute GHL operations as MCP tools</li>
              <li><strong>Type Safety:</strong> Strongly typed interfaces for all operations</li>
              <li><strong>Caching:</strong> Built-in caching for improved performance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Status Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Available Resources</h6>
              <h3>{resources.length}</h3>
              <small>GHL data resources</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Available Tools</h6>
              <h3>{tools.length}</h3>
              <small>MCP operations</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">MCP Status</h6>
              <h3>{settings.apiKey ? 'Connected' : 'Disconnected'}</h3>
              <small>Server connection</small>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="fas fa-database me-2"></i>Available Resources</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {resources.length === 0 ? (
                <p className="text-muted">No resources available. Initialize MCP server first.</p>
              ) : (
                <div className="list-group">
                  {resources.map((resource, index) => (
                    <button
                      key={index}
                      className={`list-group-item list-group-item-action ${selectedResource === resource.uri ? 'active' : ''}`}
                      onClick={() => loadResource(resource.uri)}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{resource.name}</h6>
                        <small>{resource.mimeType || 'application/json'}</small>
                      </div>
                      {resource.description && (
                        <p className="mb-1 small">{resource.description}</p>
                      )}
                      <small className="text-muted">{resource.uri}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="fas fa-tools me-2"></i>Available Tools</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {tools.length === 0 ? (
                <p className="text-muted">No tools available. Initialize MCP server first.</p>
              ) : (
                <div className="list-group">
                  {tools.map((tool, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{tool.name}</h6>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            // Show modal or form to input tool arguments
                            console.log('Execute tool:', tool.name);
                          }}
                        >
                          Execute
                        </button>
                      </div>
                      <p className="mb-1 small">{tool.description}</p>
                      <small className="text-muted">
                        Input Schema: {JSON.stringify(tool.inputSchema?.properties || {}).substring(0, 50)}...
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Content Display */}
      {resourceContent && (
        <div className="card mb-4">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0"><i className="fas fa-file-code me-2"></i>Resource Content: {selectedResource}</h5>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {JSON.stringify(resourceContent, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0"><i className="fas fa-bolt me-2"></i>Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-2">
              <button 
                className="btn btn-primary w-100"
                onClick={() => initializeMCPServer(settings.apiKey)}
              >
                <i className="fas fa-sync me-2"></i>Refresh MCP Server
              </button>
            </div>
            <div className="col-md-3 mb-2">
              <button 
                className="btn btn-info w-100"
                onClick={() => loadResource('ghl://contacts')}
              >
                <i className="fas fa-users me-2"></i>Load Contacts
              </button>
            </div>
            <div className="col-md-3 mb-2">
              <button 
                className="btn btn-success w-100"
                onClick={() => loadResource('ghl://locations')}
              >
                <i className="fas fa-map-marker-alt me-2"></i>Load Locations
              </button>
            </div>
            <div className="col-md-3 mb-2">
              <button 
                className="btn btn-warning w-100"
                onClick={() => loadResource('ghl://workflows')}
              >
                <i className="fas fa-project-diagram me-2"></i>Load Workflows
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
