
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    ShoppingCart,
    User,
    LogOut,
    ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo">
                    <ShoppingBag size={25} />
                    <span>ShopNest</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/products">Shop</Link>
                    <Link to="/orders">My Orders</Link>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="nav-user">
                                <User size={17} />
                                {user.name}
                            </span>

                            {user.role === "admin" ? (
                                <Link to="/admin" className="nav-admin-link">
                                    <ShieldCheck size={17} />
                                    Admin Dashboard
                                </Link>
                            ) : (
                                <Link to="/admin-login" className="nav-admin-link">
                                    <ShieldCheck size={17} />
                                    Admin Login
                                </Link>
                            )}

                            <button
                                className="nav-logout"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-login">
                                Login
                            </Link>

                            <Link to="/admin-login" className="nav-admin-link">
                                <ShieldCheck size={17} />
                                Admin Login
                            </Link>
                        </>
                    )}

                    <Link to="/cart" className="cart-link">
                        <ShoppingCart size={21} />
                        <span>Cart ({cartCount})</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
