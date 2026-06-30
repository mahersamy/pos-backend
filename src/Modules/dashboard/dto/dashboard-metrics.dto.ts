export class MonthlyOverviewItem {
  name: string;
  dineInSales: number;
  totalRevenue: number;
}

export class PopularDishItem {
  _id: string;
  name: string;
  price: number;
  stock: string;
  image?: { public_id: string; secure_url: string };
  totalOrdered: number;
}

export class LowStockItem {
  _id: string;
  name: string;
  quantity: number;
  stock: string;
  price: number;
  image?: { public_id: string; secure_url: string };
}

export class DashboardMetricsDto {
  dailySales: number;
  monthlyRevenue: number;
  overview: MonthlyOverviewItem[];
  popularDishes: PopularDishItem[];
  lowStockItems: LowStockItem[];
}
