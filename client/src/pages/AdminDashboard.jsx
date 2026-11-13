
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Users,
  RefreshCw,
} from "lucide-react";
import API from "../services/api";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productResponse,
        orderResponse,
        customerResponse,
      ] = await Promise.all([
        API.get("/products"),
        API.get("/orders/admin/all"),
        API.get("/users/admin/customers"),
      ]);

      setProducts(productResponse.data);
      setOrders(orderResponse.data);
      setTotalCustomers(customerResponse.data.length);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="products-message">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-message">
        <h3>{error}</h3>
        <button onClick={fetchDashboardData}>Try Again</button>
      </div>
    );
  }

  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      value: totalCustomers,
      icon: Users,
    },
    {
      title: "Order Value",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-label">ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your ShopNest store from one place.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-stat-card" key={stat.title}>
              <div className="admin-stat-icon">
                <Icon size={24} />
              </div>

              <div>
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-quick-actions">
        <h2>Store Management</h2>

        <div className="admin-action-grid">
          <Link to="/admin/products" className="admin-action-card">
            <Package size={28} />
            <h3>Manage Products</h3>
            <p>Add, edit and delete products.</p>
          </Link>

          <Link to="/admin/orders" className="admin-action-card">
            <ShoppingBag size={28} />
            <h3>Manage Orders</h3>
            <p>View orders and update their status.</p>
          </Link>

          <Link to="/admin/customers" className="admin-action-card">
            <Users size={28} />
            <h3>Manage Customers</h3>
            <p>View customers, their orders and purchase history.</p>
          </Link>
        </div>
      </section>

      <section className="admin-recent-orders">
        <div className="admin-section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders">View All</Link>
        </div>

        {orders.length === 0 ? (
          <p>No orders available.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>{order.user?.name || "Customer"}</td>
                    <td>
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span
                        className={`order-status ${order.orderStatus.toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
