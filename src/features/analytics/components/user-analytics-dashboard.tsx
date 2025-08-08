"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import { 
  Eye, 
  Trophy, 
  Code, 
  Activity,
  TrendingUp,
  Calendar,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface UserAnalyticsData {
  totalViews: number;
  weeklyTopPaste: {
    id: string;
    slug: string;
    title: string | null;
    views: number;
  } | null;
  monthlyTopPaste: {
    id: string;
    slug: string;
    title: string | null;
    views: number;
  } | null;
  languageStats: Array<{
    language: string;
    pasteCount: number;
    totalViews: number;
  }>;
  recentActivity: Array<{
    pasteId: string;
    pasteSlug: string;
    pasteTitle: string | null;
    viewedAt: Date;
    country: string | null;
    device: string | null;
  }>;
}

interface UserAnalyticsDashboardProps {
  analytics: UserAnalyticsData;
}

export function UserAnalyticsDashboard({ analytics }: UserAnalyticsDashboardProps) {
  // Prepare chart data for language stats
  const languageChartData = analytics.languageStats.slice(0, 10).map(stat => ({
    language: stat.language.charAt(0).toUpperCase() + stat.language.slice(1),
    views: stat.totalViews,
    pastes: stat.pasteCount,
  }));

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your pastes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Paste This Week</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics.weeklyTopPaste ? (
              <>
                <div className="text-2xl font-bold">
                  {analytics.weeklyTopPaste.views} views
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {analytics.weeklyTopPaste.title || `Paste ${analytics.weeklyTopPaste.slug}`}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">No data</div>
                <p className="text-xs text-muted-foreground">No views this week</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages Used</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.languageStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Different programming languages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language Performance Chart */}
      {languageChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Language Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languageChartData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.language}</span>
                    <span className="text-sm text-muted-foreground">{item.views} views</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all" 
                      style={{ 
                        width: `${(item.views / Math.max(...languageChartData.map(d => d.views))) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.pastes} paste{item.pastes !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Pastes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Performing Pastes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Weekly Top */}
            {analytics.weeklyTopPaste && (
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">This Week</Badge>
                  <Link href={`/dashboard/analytics/${analytics.weeklyTopPaste.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <h4 className="font-semibold truncate">
                  {analytics.weeklyTopPaste.title || `Paste ${analytics.weeklyTopPaste.slug}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {analytics.weeklyTopPaste.views} views
                </p>
              </div>
            )}
            
            {/* Monthly Top */}
            {analytics.monthlyTopPaste && (
              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">This Month</Badge>
                  <Link href={`/dashboard/analytics/${analytics.monthlyTopPaste.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <h4 className="font-semibold truncate">
                  {analytics.monthlyTopPaste.title || `Paste ${analytics.monthlyTopPaste.slug}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {analytics.monthlyTopPaste.views} views
                </p>
              </div>
            )}

            {!analytics.weeklyTopPaste && !analytics.monthlyTopPaste && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No paste views yet</p>
                <p className="text-xs">Create some pastes to see performance data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                  <div key={`${activity.pasteId}-${index}`} className="flex items-center justify-between py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {activity.pasteTitle || `Paste ${activity.pasteSlug}`}
                        </h4>
                        <Link href={`/dashboard/analytics/${activity.pasteId}`}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Viewed {formatDistanceToNow(activity.viewedAt, { addSuffix: true })}</span>
                        {activity.country && activity.country !== "unknown" && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {activity.country.toUpperCase()}
                          </Badge>
                        )}
                        {activity.device && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {activity.device}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-xs">Views on your pastes will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Stats Table */}
      {analytics.languageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Language Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.languageStats.map((stat, index) => (
                <div key={stat.language} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 text-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">
                      {stat.language.charAt(0).toUpperCase() + stat.language.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {stat.pasteCount} paste{stat.pasteCount !== 1 ? 's' : ''}
                    </span>
                    <span className="font-medium min-w-16 text-right">
                      {stat.totalViews.toLocaleString()} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}