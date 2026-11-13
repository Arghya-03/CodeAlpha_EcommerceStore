
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
    const { addToCart } = useCart();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const { data } = await API.get(`/products/${id}`);
                setProduct(data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load product.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="products-message">Loading product...</div>;
    }

    if (error || !product) {
        return (
            <div className="products-message">
                <h3>{error || "Product not found"}</h3>
                <Link to="/products">Back to shopping</Link>
            </div>
        );
    }

    return (
        <main className="product-details-page">
            <Link to="/products" className="back-link">
                <ArrowLeft size={17} /> Back to products
            </Link>

            <div className="product-details-layout">
                <div className="product-details-image">
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-details-info">
                    <span className="product-category">{product.category}</span>
                    <h1>{product.name}</h1>
                    <p className="product-brand">Brand: {product.brand}</p>

                    <h2 className="details-price">
                        ₹{product.price.toLocaleString("en-IN")}
                    </h2>

                    <p className="details-description">{product.description}</p>

                    <p className={product.stock > 0 ? "stock-available" : "stock-unavailable"}>
                        {product.stock > 0
                            ? `${product.stock} items available`
                            : "Currently out of stock"}
                    </p>

                    <button
                        className="add-cart-button"
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                    >
                        <ShoppingCart size={19} />
                        Add to Cart
                    </button>

                    <div className="product-promises">
                        <div><Truck size={20} /> Reliable delivery</div>
                        <div><ShieldCheck size={20} /> Secure shopping</div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetails;
