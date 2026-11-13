
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal,
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <div className="empty-cart">
                    <ShoppingBag size={55} />
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/products" className="continue-shopping">
                        Start Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <h1>Shopping Cart</h1>
            <p className="cart-subtitle">
                You have {cartItems.length} different product(s) in your cart.
            </p>

            <div className="cart-layout">
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div className="cart-item" key={item._id}>
                            <img src={item.image} alt={item.name} />

                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>₹{item.price.toLocaleString("en-IN")}</p>

                                <div className="quantity-controls">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item._id, item.quantity - 1)
                                        }
                                        disabled={item.quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={15} />
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(item._id, item.quantity + 1)
                                        }
                                        disabled={item.quantity >= item.stock}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="cart-item-actions">
                                <strong>
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </strong>

                                <button
                                    className="remove-cart-item"
                                    onClick={() => removeFromCart(item._id)}
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="cart-summary">
                    <h2>Order Summary</h2>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="summary-row">
                        <span>Delivery</span>
                        <span>Calculated at checkout</span>
                    </div>

                    <div className="summary-total">
                        <span>Total</span>
                        <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                    </div>

                    <Link to="/checkout" className="checkout-button">
                        Proceed to Checkout
                    </Link>

                    <Link to="/products" className="continue-shopping-link">
                        Continue Shopping
                    </Link>
                </aside>
            </div>
        </main>
    );
};

export default Cart;
