
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import API from "../services/api";

const AdminEditProduct = () => {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await API.get(`/products/${id}`);

                setFormData({
                    name: data.name || "",
                    description: data.description || "",
                    price: data.price ?? "",
                    category: data.category || "",
                    brand: data.brand || "",
                    image: data.image || "",
                    stock: data.stock ?? "",
                    isFeatured: data.isFeatured || false,
                });
            } catch (err) {
                setError(
                    err.response?.data?.message || "Unable to load product."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

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
            setSaving(true);

            await API.put(`/products/${id}`, {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
            });

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update product."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="products-message">
                Loading product information...
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="products-message">
                <h3>{error}</h3>
                <Link to="/admin/products">Back to Products</Link>
            </div>
        );
    }

    return (
        <main className="admin-product-form-page">
            <Link to="/admin/products" className="admin-back-link">
                <ArrowLeft size={17} />
                Back to Products
            </Link>

            <div className="admin-form-heading">
                <span className="admin-label">STORE MANAGEMENT</span>
                <h1>Edit Product</h1>
                <p>Update the information of your existing product.</p>
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

                    <button type="submit" disabled={saving}>
                        <Save size={18} />
                        {saving ? "Updating..." : "Update Product"}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default AdminEditProduct;
