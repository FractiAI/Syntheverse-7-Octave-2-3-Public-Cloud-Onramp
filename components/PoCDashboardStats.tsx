'use client'

import { useEffect, useState } from 'react'
import { api, type ArchiveStatistics, type TokenomicsStatistics, type EpochInfo } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatDate } from '@/lib/utils'
import { Award, Users, FileText, TrendingUp, Coins, RefreshCw, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'

const COLORS = {
  gold: '#FCD34D',
  silver: '#94A3B8',
  copper: '#CD7F32',
}

export function PoCDashboardStats() {
  const [stats, setStats] = useState<ArchiveStatistics | null>(null)
  const [tokenomics, setTokenomics] = useState<TokenomicsStatistics | null>(null)
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // API is now internal (Next.js API routes), no need to check for external API URL
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Use Promise.allSettled to see which APIs succeed/fail
      const results = await Promise.allSettled([
        api.getArchiveStatistics(),
        api.getTokenomicsStatistics(),
        api.getEpochInfo()
      ])

      const [archiveResult, tokenomicsResult, epochResult] = results

      if (archiveResult.status === 'fulfilled') {
        setStats(archiveResult.value)
      } else {
        console.error('Dashboard: Archive stats failed:', archiveResult.reason)
      }

      if (tokenomicsResult.status === 'fulfilled') {
        setTokenomics(tokenomicsResult.value)
      } else {
        console.error('Dashboard: Tokenomics stats failed:', tokenomicsResult.reason)
      }

      if (epochResult.status === 'fulfilled') {
        setEpochInfo(epochResult.value)
      } else {
        console.error('Dashboard: Epoch info failed:', epochResult.reason)
      }

      // Check if all APIs failed
      if (results.every(r => r.status === 'rejected')) {
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => r.reason instanceof Error ? r.reason.message : String(r.reason))
          .join('; ')
        throw new Error(`Unable to connect to PoC API endpoints. ${errors}`)
      }

      setLoading(false)
    } catch (err) {
      console.error('Dashboard: Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load PoC evaluation data')
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PoC Evaluation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">Loading PoC evaluation data...</div>
              <div className="text-sm text-muted-foreground">
                Fetching archive statistics, tokenomics data, and epoch information
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            PoC API Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button onClick={() => loadData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusData = stats
    ? Object.entries(stats.status_counts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
    : []

  const metalData = stats
    ? Object.entries(stats.metal_counts).map(([metal, count]) => ({
        name: metal.charAt(0).toUpperCase() + metal.slice(1),
        value: count,
        color: COLORS[metal as keyof typeof COLORS] || '#888',
      }))
    : []

  const epochData = epochInfo
    ? Object.entries(epochInfo.epochs).map(([epoch, data]) => ({
        epoch: epoch.charAt(0).toUpperCase() + epoch.slice(1),
        balance: data.balance / 1e12, // Convert to trillions
        distribution: data.distribution_percent,
      }))
    : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>PoC Evaluation Statistics</CardTitle>
          <Button onClick={() => loadData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
                    <p className="text-2xl font-bold mt-1">{stats?.total_contributions || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contributors</p>
                    <p className="text-2xl font-bold mt-1">{stats?.unique_contributors || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Distributed</p>
                    <p className="text-2xl font-bold mt-1">
                      {tokenomics ? formatNumber(tokenomics.total_distributed / 1e12) : '0'}T
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Epoch</p>
                    <p className="text-2xl font-bold mt-1 capitalize">
                      {epochInfo?.current_epoch || 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {stats && (statusData.length > 0 || metalData.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {statusData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contribution Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {metalData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metal Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={metalData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {metalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Epoch Distribution */}
          {epochData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Epoch Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {epochData.map((epoch) => (
                    <div key={epoch.epoch} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{epoch.epoch}</span>
                        <span className="text-muted-foreground">
                          {formatNumber(epoch.balance)}T ({epoch.distribution.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${epoch.distribution}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Updated */}
          {stats && (
            <div className="text-sm text-muted-foreground text-center mt-4">
              Last updated: {formatDate(stats.last_updated)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

