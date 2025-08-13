'use client';

import React, { useState, useEffect } from 'react';
import { UserService } from '@/services/database';
import { User } from '@/types/database';

interface MarketingData {
  source: string;
  count: number;
  percentage: number;
}

export default function MarketingAnalytics() {
  const [marketingData, setMarketingData] = useState<MarketingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>('90');

  useEffect(() => {
    fetchMarketingData();
  }, [dateRange]);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      // Get all clients using the existing method
      const clients = await UserService.getClients();
      
      // Filter by date range if not 'all'
      let filteredClients = clients;
      if (dateRange !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
        
        filteredClients = clients.filter((client: User) => {
          const createdAt = client.profile.createdAt;
          if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
            return (createdAt as any).toDate() >= cutoffDate;
          }
          return false;
        });
      }

      // Count marketing sources
      const sourceCounts: { [key: string]: number } = {};
      filteredClients.forEach((client: User) => {
        const source = client.profile.hearAboutUs || 'Not Specified';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      // Convert to array and calculate percentages
      const total = filteredClients.length;
      const data: MarketingData[] = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      setMarketingData(data);
      setTotalClients(total);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (index: number) => {
    const colors = [
      '#AD6269', '#8B4A52', '#6B3840', '#4A252B', '#2A1318',
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ];
    return colors[index % colors.length];
  };

  const getPieColors = () => {
    return marketingData.map((_, index) => getBarColor(index));
  };

  const maxCount = Math.max(...marketingData.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading marketing analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-3" style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-chart-bar text-white fs-5"></i>
                  </div>
                  <div>
                    <h4 className="mb-1 text-white fw-bold">Marketing Analytics</h4>
                    <p className="mb-0 text-white-50 small">Client acquisition tracking and insights</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm bg-white border-0 rounded-pill"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as '30' | '90' | '365' | 'all')}
                    style={{ minWidth: '150px' }}
                  >
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  <button
                    className="btn btn-light btn-sm rounded-pill px-3"
                    onClick={fetchMarketingData}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-users text-primary fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-primary mb-1">{totalClients}</h3>
              <p className="text-muted mb-0 small">Total New Clients</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-chart-line text-success fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-success mb-1">{marketingData.length}</h3>
              <p className="text-muted mb-0 small">Marketing Channels</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-trophy text-warning fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-warning mb-1">{marketingData[0]?.source.substring(0, 10) || 'N/A'}</h3>
              <p className="text-muted mb-0 small">Top Source</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-percentage text-info fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-info mb-1">{marketingData[0]?.percentage || 0}%</h3>
              <p className="text-muted mb-0 small">Top Source Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4">
        {/* Bar Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-bar me-2 text-primary"></i>
                Client Acquisition by Marketing Channel
              </h5>
            </div>
            <div className="card-body p-4">
              {marketingData.length > 0 ? (
                <div className="chart-container">
                  {marketingData.map((data, index) => (
                    <div key={data.source} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-dark">{data.source}</span>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge rounded-pill" style={{ backgroundColor: getBarColor(index), color: 'white' }}>
                            {data.count} clients
                          </span>
                          <span className="text-muted small">{data.percentage}%</span>
                        </div>
                      </div>
                      <div className="progress" style={{ height: '12px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${(data.count / maxCount) * 100}%`,
                            backgroundColor: getBarColor(index)
                          }}
                          aria-valuenow={data.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-chart-bar text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No Data Available</h5>
                  <p className="text-muted">No client data found for the selected time period.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-pie me-2 text-primary"></i>
                Distribution Overview
              </h5>
            </div>
            <div className="card-body p-4">
              {marketingData.length > 0 ? (
                <>
                  {/* Simple CSS-based Pie Chart */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <div
                        className="rounded-circle"
                        style={{
                          width: '200px',
                          height: '200px',
                          background: `conic-gradient(${marketingData.map((data, index) => 
                            `${getBarColor(index)} 0deg ${(marketingData.slice(0, index + 1).reduce((sum, d) => sum + d.percentage, 0) * 3.6)}deg`
                          ).join(', ')})`
                        }}
                      ></div>
                      <div className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                        <div className="text-center">
                          <div className="fw-bold text-primary">{totalClients}</div>
                          <div className="small text-muted">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="legend">
                    {marketingData.map((data, index) => (
                      <div key={data.source} className="d-flex align-items-center mb-2">
                        <div
                          className="rounded-circle me-2"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: getBarColor(index)
                          }}
                        ></div>
                        <div className="flex-grow-1">
                          <div className="small fw-semibold text-dark">{data.source}</div>
                          <div className="small text-muted">{data.count} clients ({data.percentage}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-chart-pie text-muted fs-1 mb-3"></i>
                  <h6 className="text-muted">No Data Available</h6>
                  <p className="text-muted small">No client data found for the selected time period.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-table me-2 text-primary"></i>
                Detailed Marketing Data
              </h5>
            </div>
            <div className="card-body p-0">
              {marketingData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 fw-bold text-dark">Rank</th>
                        <th className="border-0 fw-bold text-dark">Marketing Source</th>
                        <th className="border-0 fw-bold text-dark">Client Count</th>
                        <th className="border-0 fw-bold text-dark">Percentage</th>
                        <th className="border-0 fw-bold text-dark">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketingData.map((data, index) => (
                        <tr key={data.source}>
                          <td className="align-middle">
                            <span className="badge bg-secondary rounded-pill">#{index + 1}</span>
                          </td>
                          <td className="align-middle fw-semibold">{data.source}</td>
                          <td className="align-middle">
                            <span className="badge rounded-pill" style={{ backgroundColor: getBarColor(index), color: 'white' }}>
                              {data.count}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className="fw-bold text-primary">{data.percentage}%</span>
                          </td>
                          <td className="align-middle">
                            <div className="progress" style={{ height: '8px', width: '100px' }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${data.percentage}%`,
                                  backgroundColor: getBarColor(index)
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-table text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No Data Available</h5>
                  <p className="text-muted">No client data found for the selected time period.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
