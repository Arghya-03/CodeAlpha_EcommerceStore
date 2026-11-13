
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    ArrowLeft,
} from "lucide-react";
import API from "../services/api";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await API.get("/products");
            setProducts(data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            setDeleteId(id);
            await API.delete(`/products/${id}`);

            setProducts((previousProducts) =>
                previousProducts.filter((product) => product._id !== id)
            );
        } catch (err) {
            alert(
                err.response?.data?.message || "Unable to delete product."
            );
        } finally {
            setDeleteId(null);
        }
    };

    const filteredProducts = products.filter((product) => {
        const searchText = search.toLowerCase();

        return (
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText) ||
            product.brand.toLowerCase().includes(searchText)
        );
    });

    return (
        <main className="admin-products-page">
            <Link to="/admin" className="admin-back-link">
                <ArrowLeft size={17} />
                Back to Dashboard
            </Link>

            <div className="admin-products-header">
                <div>
                    <span className="admin-label">STORE MANAGEMENT</span>
                    <h1>Manage Products</h1>
                    <p>Add, edit, search and manage your store products.</p>
                </div>

                <Link to="/admin/products/new" className="admin-add-button">
                    <Plus size={19} />
                    Add Product
                </Link>
            </div>

            <div className="admin-products-toolbar">
                <div className="admin-product-search">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search by product, brand or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <span>{filteredProducts.length} products found</span>
            </div>

            {loading ? (
                <div className="products-message">Loading products...</div>
            ) : error ? (
                <div className="products-message">
                    <p>{error}</p>
                    <button onClick={fetchProducts}>Try Again</button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="admin-products-empty">
                    <Package size={45} />
                    <h3>No products found</h3>
                    <p>Try a different search term.</p>
                </div>
            ) : (
                <div className="admin-products-table-wrapper">
                    <table className="admin-products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Brand</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="admin-product-info">
                                            <img src={product.image} alt={product.name} />
                                            <strong>{product.name}</strong>
                                        </div>
                                    </td>

                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>

                                    <td>
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                product.stock > 0
                                                    ? "admin-stock-available"
                                                    : "admin-stock-unavailable"
                                            }
                                        >
                                            {product.stock}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-product-actions">
                                            <Link
                                                to={`/admin/products/edit/${product._id}`}
                                                className="admin-edit-button"
                                                aria-label={`Edit ${product.name}`}
                                                title="Edit product"
                                            >
                                                <Edit size={17} />
                                            </Link>

                                            <button
                                                className="admin-delete-button"
                                                onClick={() => handleDelete(product._id)}
                                                disabled={deleteId === product._id}
                                                aria-label={`Delete ${product.name}`}
                                                title="Delete product"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
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

export default AdminProducts;
