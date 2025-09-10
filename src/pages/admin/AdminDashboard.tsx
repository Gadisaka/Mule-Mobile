import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Package,
  Users,
  ShoppingCart,
  FolderOpen,
  Settings,
  TrendingUp,
  Activity,
} from "lucide-react";
import { API_URL } from "../../../constants";
import { useOrderStore, OrderItem } from "../../store/orderStore";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalServices: number;
  totalUsers: number;
  totalOrders: number;
  totalFavorites: number;
}

interface RecentProduct {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
}
interface RecentUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}
interface RecentData {
  products: RecentProduct[];
  users: RecentUser[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { adminOrders, fetchAllOrdersAdmin } = useOrderStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("user");
        if (!token) return;

        const userData = JSON.parse(token);
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecent(data.recent);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchAllOrdersAdmin();
  }, [fetchAllOrdersAdmin]);

  type PopulatedProduct = {
    _id: string;
    name: string;
    price: number;
    image?: string[];
    category?: { _id: string; name: string } | string;
  };

  const isPopulatedProduct = useCallback(
    (product: OrderItem["productId"]): product is PopulatedProduct =>
      typeof product === "object" && product !== null && "price" in product,
    []
  );

  const isPopulatedUser = (
    user: OrderItem["userId"]
  ): user is { _id: string; name: string; email: string } =>
    typeof user === "object" && user !== null && "email" in user;

  const revenue = useMemo(() => {
    return adminOrders.reduce((sum, o) => sum + o.totalMoney, 0);
  }, [adminOrders]);

  const revenueInclVAT = useMemo(() => revenue * 1.15, [revenue]);
  const orderCount = adminOrders.length;
  const averageOrderValue = useMemo(
    () => (orderCount ? revenueInclVAT / orderCount : 0),
    [revenueInclVAT, orderCount]
  );

  // Orders metrics (today, last 7 days, this month, total)
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const ordersToday = useMemo(
    () =>
      adminOrders.filter((o) => new Date(o.createdAt) >= startOfToday).length,
    [adminOrders]
  );
  const ordersThisWeek = useMemo(
    () =>
      adminOrders.filter((o) => new Date(o.createdAt) >= startOfWeek).length,
    [adminOrders]
  );
  const ordersThisMonth = useMemo(
    () =>
      adminOrders.filter((o) => new Date(o.createdAt) >= startOfMonth).length,
    [adminOrders]
  );
  const ordersTotal = orderCount;

  const topCategories = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    for (const o of adminOrders) {
      if (isPopulatedProduct(o.productId) && o.productId.category) {
        const cat = o.productId.category;
        const id = typeof cat === "string" ? cat : cat._id;
        const name = typeof cat === "string" ? cat : cat.name;
        counts[id] = counts[id]
          ? { name, count: counts[id].count + 1 }
          : { name, count: 1 };
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [adminOrders, isPopulatedProduct]);

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Services",
      value: stats?.totalServices || 0,
      icon: Settings,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ordersToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ordersThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ordersThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ordersTotal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/admin/products")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manage</p>
              <p className="font-semibold">Products</p>
            </div>
            <Package className="w-6 h-6 text-gray-500" />
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/admin/categories")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manage</p>
              <p className="font-semibold">Categories</p>
            </div>
            <FolderOpen className="w-6 h-6 text-gray-500" />
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/admin/orders")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">View</p>
              <p className="font-semibold">Orders</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-gray-500" />
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/admin/services")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manage</p>
              <p className="font-semibold">Services</p>
            </div>
            <Settings className="w-6 h-6 text-gray-500" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Recent Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent?.products?.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Recent Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent?.users?.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminOrders.slice(0, 6).map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                      {isPopulatedProduct(o.productId) &&
                      o.productId.image?.[0] ? (
                        <img
                          src={o.productId.image[0]}
                          alt={o.productId.name}
                          className="w-10 h-10 object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gray-500 m-2.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isPopulatedProduct(o.productId)
                          ? o.productId.name
                          : String(o.productId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty {o.amount} •{" "}
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total (incl. VAT)</p>
                    <p className="font-semibold">
                      ETB {(o.totalMoney * 1.15).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {adminOrders.length === 0 && (
                <p className="text-sm text-gray-500">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
