"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/dupui/tabs";
import { 
  Eye, 
  Calendar, 
  MapPin, 
  Monitor, 
  Globe, 
  Clock,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  paste: {
    title: string | null;
    slug: string;
    totalViews: number;
    createdAt: Date;
  };
  lastViewed: Date | null;
  topCountries: Array<{ country: string; views: number }>;
  regionBreakdown: Array<{ region: string; views: number }>;
  cityBreakdown: Array<{ city: string; views: number }>;
  continentBreakdown: Array<{ continent: string; views: number }>;
  deviceBreakdown: Array<{ device: string | null; views: number }>;
  browserBreakdown: Array<{ browser: string | null; views: number }>;
  osBreakdown: Array<{ os: string | null; views: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  peakHour: number | null;
}

interface PasteAnalyticsDashboardProps {
  analytics: AnalyticsData;
}

// Colors for charts
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function PasteAnalyticsDashboard({ analytics }: PasteAnalyticsDashboardProps) {
  const title = analytics.paste.title || `Paste ${analytics.paste.slug}`;
  
  // Format daily views data for chart
  const chartData = analytics.dailyViews.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: item.views,
  }));
  
  // Prepare pie chart data
  const deviceData = analytics.deviceBreakdown
    .filter(item => item.device !== null)
    .map((item, index) => ({
      name: item.device!.charAt(0).toUpperCase() + item.device!.slice(1),
      value: item.views,
      fill: COLORS[index % COLORS.length],
    }));
  
  const browserData = analytics.browserBreakdown
    .filter(item => item.browser !== null)
    .map((item, index) => ({
      name: item.browser!.charAt(0).toUpperCase() + item.browser!.slice(1),
      value: item.views,
      fill: COLORS[index % COLORS.length],
    }));
  
  const osData = analytics.osBreakdown
    .filter(item => item.os !== null)
    .map((item, index) => ({
      name: item.os!.charAt(0).toUpperCase() + item.os!.slice(1),
      value: item.views,
      fill: COLORS[index % COLORS.length],
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">
            Analytics for /{analytics.paste.slug}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.paste.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Since {formatDistanceToNow(analytics.paste.createdAt, { addSuffix: true })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Viewed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.lastViewed 
                ? formatDistanceToNow(analytics.lastViewed, { addSuffix: true })
                : "Never"
              }
            </div>
            <p className="text-xs text-muted-foreground">Most recent view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topCountries[0]?.country.toUpperCase() || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topCountries[0]?.views || 0} views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.peakHour !== null ? `${analytics.peakHour}:00` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most active time</p>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Views Over Time (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chartData.length > 0 ? (
              <div className="space-y-2">
                {chartData.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(10, (item.views / Math.max(...chartData.map(d => d.views))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{item.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No view data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="countries" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="countries">Countries</TabsTrigger>
                <TabsTrigger value="cities">Cities</TabsTrigger>
                <TabsTrigger value="regions">Regions</TabsTrigger>
                <TabsTrigger value="continents">Continents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="countries" className="mt-4">
                <div className="space-y-3">
                  {analytics.topCountries.length > 0 ? (
                    analytics.topCountries.map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{country.country.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(country.views / analytics.topCountries[0].views) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{country.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No country data</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="cities" className="mt-4">
                <div className="space-y-3">
                  {analytics.cityBreakdown && analytics.cityBreakdown.length > 0 ? (
                    analytics.cityBreakdown.map((city) => (
                      <div key={city.city} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{city.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(city.views / Math.max(...analytics.cityBreakdown.map(c => c.views))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{city.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No city data available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="regions" className="mt-4">
                <div className="space-y-3">
                  {analytics.regionBreakdown && analytics.regionBreakdown.length > 0 ? (
                    analytics.regionBreakdown.map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{region.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(region.views / Math.max(...analytics.regionBreakdown.map(r => r.views))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{region.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No regional data available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="continents" className="mt-4">
                <div className="space-y-3">
                  {analytics.continentBreakdown && analytics.continentBreakdown.length > 0 ? (
                    analytics.continentBreakdown.map((continent) => (
                      <div key={continent.continent} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{continent.continent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(continent.views / Math.max(...analytics.continentBreakdown.map(c => c.views))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{continent.views}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MapPin className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No continental data available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Device & Technical Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device & Technical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="browsers">Browsers</TabsTrigger>
                <TabsTrigger value="os">OS</TabsTrigger>
              </TabsList>
              
              <TabsContent value="devices" className="mt-4">
                <div className="space-y-3">
                  {deviceData.length > 0 ? (
                    deviceData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                backgroundColor: item.fill,
                                width: `${(item.value / Math.max(...deviceData.map(d => d.value))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Monitor className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No device data</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="browsers" className="mt-4">
                <div className="space-y-3">
                  {browserData.length > 0 ? (
                    browserData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                backgroundColor: item.fill,
                                width: `${(item.value / Math.max(...browserData.map(d => d.value))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Globe className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No browser data</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="os" className="mt-4">
                <div className="space-y-3">
                  {osData.length > 0 ? (
                    osData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                backgroundColor: item.fill,
                                width: `${(item.value / Math.max(...osData.map(d => d.value))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Monitor className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No OS data</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
            </Tabs>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}