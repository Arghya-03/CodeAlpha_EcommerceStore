
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <main className="order-success-page">
      <div className="order-success-card">
        <CheckCircle size={75} className="success-icon" />

        <h1>Order Placed Successfully!</h1>

        <p>
          Thank you for shopping with ShopNest.
          Your order has been received.
        </p>

        {order?._id && (
          <div className="order-reference">
            <span>Order ID</span>
            <strong>{order._id}</strong>
          </div>
        )}

        <div className="success-delivery-info">
          <Package size={25} />
          <div>
            <strong>Cash on Delivery</strong>
            <p>You can pay when your order arrives.</p>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/products" className="continue-shopping">
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link to="/orders" className="view-orders">
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
