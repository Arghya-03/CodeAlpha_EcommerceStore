
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const { data } = await API.post("/auth/login", formData);

            if (data.user.role !== "admin") {
                setError("Access denied. Administrator account required.");
                return;
            }

            localStorage.setItem("shopnest_token", data.token);
            localStorage.setItem("shopnest_user", JSON.stringify(data.user));

            setUser(data.user);

            navigate("/admin");
            
        } catch (err) {
            setError(
                err.response?.data?.message || "Admin login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card admin-login-card">
                <div className="admin-login-icon">
                    <ShieldCheck size={38} />
                </div>

                <h1>Admin Login</h1>
                <p>Sign in to manage your ShopNest store.</p>

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter admin email"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter admin password"
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        <LockKeyhole size={17} />
                        {loading ? "Signing in..." : "Access Admin Dashboard"}
                    </button>
                </form>

                <Link to="/" className="admin-back-link">
                    Back to ShopNest
                </Link>
            </div>
        </main>
    );
};

export default AdminLogin;
