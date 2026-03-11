export interface SalesData {
  date: string;
  region: string;
  category: string;
  product: string;
  revenue: number;
  units: number;
  customer: string;
}

export type GenericData = Record<string, any>;

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}

export interface DashboardChart {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  xAxis: string;
  yAxis: string;
}

export interface DashboardConfig {
  metrics: DashboardMetric[];
  charts: DashboardChart[];
  insights: string[];
  filters?: {
    regions?: string[];
    categories?: string[];
    dateRange?: { start: string; end: string };
  };
}
