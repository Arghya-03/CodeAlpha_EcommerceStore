
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    RefreshCw,
    Package,
    CalendarDays,
    User,
} from "lucide-react";
import API from "../services/api";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await API.get("/orders/admin/all");
            setOrders(data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, orderStatus) => {
        try {
            setUpdatingId(orderId);

            const { data } = await API.put(
                `/orders/${orderId}/status`,
                { orderStatus }
            );

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order._id === orderId ? data.order : order
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const customerName = order.user?.name || "";
        const customerEmail = order.user?.email || "";

        const matchesSearch =
            order._id.toLowerCase().includes(search.toLowerCase()) ||
            customerName.toLowerCase().includes(search.toLowerCase()) ||
            customerEmail.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            order.orderStatus === statusFilter;

        const matchesPayment =
            paymentFilter === "All" ||
            order.paymentMethod === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN");

    return (
        <main className="admin-orders-page">
            <Link to="/admin" className="admin-back-link">
                <ArrowLeft size={17} />
                Back to Dashboard
            </Link>

            <div className="admin-orders-header">
                <div>
                    <span className="admin-label">STORE MANAGEMENT</span>
                    <h1>Manage Orders</h1>
                    <p>View customer purchases and manage order status.</p>
                </div>

                <button
                    className="admin-refresh-button"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="admin-orders-stats">
                <div>
                    <span>Total Orders</span>
                    <strong>{orders.length}</strong>
                </div>
                <div>
                    <span>Processing</span>
                    <strong>
                        {orders.filter((o) => o.orderStatus === "Processing").length}
                    </strong>
                </div>
                <div>
                    <span>Shipped</span>
                    <strong>
                        {orders.filter((o) => o.orderStatus === "Shipped").length}
                    </strong>
                </div>
                <div>
                    <span>Delivered</span>
                    <strong>
                        {orders.filter((o) => o.orderStatus === "Delivered").length}
                    </strong>
                </div>
            </div>

            <div className="admin-orders-toolbar">
                <div className="admin-order-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID, customer or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="All">All Payments</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Online">Online</option>
                </select>
            </div>

            {loading ? (
                <div className="products-message">Loading orders...</div>
            ) : error ? (
                <div className="products-message">
                    <p>{error}</p>
                    <button onClick={fetchOrders}>Try Again</button>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="admin-orders-empty">
                    <Package size={45} />
                    <h3>No orders found</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            ) : (
                <div className="admin-orders-list">
                    {filteredOrders.map((order) => (
                        <article className="admin-order-card" key={order._id}>
                            <div className="admin-order-card-header">
                                <div>
                                    <span>Order ID</span>
                                    <strong>#{order._id}</strong>
                                </div>

                                <span className={`admin-order-status status-${order.orderStatus.toLowerCase()}`}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            <div className="admin-order-customer">
                                <div>
                                    <User size={17} />
                                    <span>
                                        {order.user?.name || "Unknown customer"}
                                    </span>
                                </div>
                                <span>{order.user?.email || "No email available"}</span>
                            </div>

                            <div className="admin-order-meta">
                                <span>
                                    <CalendarDays size={16} />
                                    {formatDate(order.createdAt)}
                                </span>
                                <span>
                                    {order.items.length} product(s)
                                </span>
                                <span>{order.paymentMethod}</span>
                                <strong>
                                    ₹{order.totalAmount.toLocaleString("en-IN")}
                                </strong>
                            </div>

                            <div className="admin-order-products">
                                {order.items.map((item, index) => (
                                    <div
                                        className="admin-order-product"
                                        key={`${order._id}-${item.product?._id || item.product || index}`}
                                    >
                                        <img src={item.image} alt={item.name} />
                                        <div>
                                            <strong>{item.name}</strong>
                                            <span>Quantity: {item.quantity}</span>
                                        </div>
                                        <strong>
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-order-footer">
                                <span>
                                    Payment: <strong>{order.paymentStatus}</strong>
                                </span>

                                <select
                                    value={order.orderStatus}
                                    onChange={(e) =>
                                        handleStatusChange(order._id, e.target.value)
                                    }
                                    disabled={updatingId === order._id}
                                    aria-label={`Update status for order ${order._id}`}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
};

export default AdminOrders;
