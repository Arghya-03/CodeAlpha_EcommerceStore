
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, Clock, Truck } from "lucide-react";
import API from "../services/api";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const { data } = await API.get("/orders/my-orders");
                setOrders(data);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Unable to load your orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="products-message">Loading your orders...</div>;
    }

    if (error) {
        return (
            <div className="products-message">
                <h3>{error}</h3>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <main className="my-orders-page">
                <div className="empty-orders">
                    <ShoppingBag size={55} />
                    <h2>No orders yet</h2>
                    <p>Your placed orders will appear here.</p>
                    <Link to="/products" className="continue-shopping">
                        Start Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="my-orders-page">
            <h1>My Orders</h1>
            <p className="orders-subtitle">
                Track and manage your ShopNest purchases.
            </p>

            <div className="orders-list">
                {orders.map((order) => (
                    <div className="order-card" key={order._id}>
                        <div className="order-card-header">
                            <div>
                                <span>Order ID</span>
                                <strong>{order._id}</strong>
                            </div>

                            <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                                {order.orderStatus}
                            </span>
                        </div>

                        <div className="order-card-details">
                            <div>
                                <Package size={19} />
                                <span>{order.items.length} product(s)</span>
                            </div>

                            <div>
                                <Clock size={19} />
                                <span>
                                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                </span>
                            </div>

                            <div>
                                <Truck size={19} />
                                <span>{order.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="order-products">
                            {order.items.map((item, index) => (
                                <div
                                    className="order-product-item"
                                    key={item.product?._id || `${item.name}-${index}`}
                                >
                                    <img src={item.image} alt={item.name} />

                                    <div>
                                        <h4>{item.name}</h4>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>

                                    <strong>
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="order-card-footer">
                            <div>
                                <span>Payment Status</span>
                                <strong>{order.paymentStatus}</strong>
                            </div>

                            <div className="order-total">
                                <span>Total Amount</span>
                                <strong>
                                    ₹{order.totalAmount.toLocaleString("en-IN")}
                                </strong>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default MyOrders;
