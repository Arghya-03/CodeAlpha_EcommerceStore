
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import API from "../services/api";

const AdminProductForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        image: "",
        stock: "",
        isFeatured: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            await API.post("/products", {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
            });

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to add product."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="admin-product-form-page">
            <Link to="/admin/products" className="admin-back-link">
                <ArrowLeft size={17} />
                Back to Products
            </Link>

            <div className="admin-form-heading">
                <span className="admin-label">STORE MANAGEMENT</span>
                <h1>Add New Product</h1>
                <p>Enter the details to add a product to your store.</p>
            </div>

            <form className="admin-product-form" onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label htmlFor="name">Product Name</label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="brand">Brand</label>
                        <input
                            id="brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="Enter brand name"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="price">Price (₹)</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="stock">Available Stock</label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="Enter stock quantity"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Home & Living">Home & Living</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Beauty">Beauty</option>
                            <option value="Sports">Sports</option>
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="image">Product Image URL</label>
                        <input
                            id="image"
                            name="image"
                            type="url"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>
                </div>

                <div className="admin-form-group admin-description-group">
                    <label htmlFor="description">Product Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your product..."
                        required
                    />
                </div>

                <label className="admin-featured-option">
                    <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                    />
                    Feature this product on the homepage
                </label>

                {error && <p className="auth-error">{error}</p>}

                <div className="admin-form-actions">
                    <Link to="/admin/products" className="admin-cancel-button">
                        Cancel
                    </Link>

                    <button type="submit" disabled={loading}>
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default AdminProductForm;
