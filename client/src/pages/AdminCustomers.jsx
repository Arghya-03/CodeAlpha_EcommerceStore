
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  Mail,
  CalendarDays,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import API from "../services/api";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get("/users/admin/customers");
      setCustomers(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name || "";
    const email = customer.email || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalOrders = customers.reduce(
    (total, customer) => total + (customer.totalOrders || 0),
    0
  );

  const totalRevenue = customers.reduce(
    (total, customer) => total + (customer.totalSpent || 0),
    0
  );

  return (
    <main className="admin-customers-page">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <div className="admin-customers-header">
        <div>
          <span className="admin-label">STORE MANAGEMENT</span>
          <h1>Customer Management</h1>
          <p>View and manage your registered ShopNest customers.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchCustomers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="admin-customers-stats">
        <div>
          <Users size={23} />
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div>
          <ShoppingBag size={23} />
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>

        <div>
          <IndianRupee size={23} />
          <span>Total Purchase Value</span>
          <strong>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      <div className="admin-customer-toolbar">
        <div className="admin-customer-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span>{filteredCustomers.length} customers found</span>
      </div>

      {loading ? (
        <div className="products-message">Loading customers...</div>
      ) : error ? (
        <div className="products-message">
          <p>{error}</p>
          <button onClick={fetchCustomers}>Try Again</button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="admin-customers-empty">
          <Users size={45} />
          <h3>No customers found</h3>
          <p>Try another search term.</p>
        </div>
      ) : (
        <div className="admin-customers-table-wrapper">
          <table className="admin-customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email Address</th>
                <th>Joined</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="admin-customer-name">
                      <span>
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="admin-customer-email">
                      <Mail size={15} />
                      {customer.email}
                    </span>
                  </td>

                  <td>
                    <span className="admin-customer-date">
                      <CalendarDays size={15} />
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                  </td>

                  <td>{customer.totalOrders || 0}</td>

                  <td>
                    <strong>
                      ₹{(customer.totalSpent || 0).toLocaleString("en-IN")}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default AdminCustomers;
