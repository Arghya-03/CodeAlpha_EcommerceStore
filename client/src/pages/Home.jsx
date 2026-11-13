
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ShoppingBag,
    Truck,
    ShieldCheck,
    Headphones,
} from "lucide-react";
import API from "../services/api";

const categories = [
    { name: "Electronics", icon: "💻" },
    { name: "Fashion", icon: "👕" },
    { name: "Home & Living", icon: "🏠" },
    { name: "Accessories", icon: "⌚" },
    { name: "Beauty", icon: "✨" },
    { name: "Sports", icon: "⚽" },
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const { data } = await API.get("/products");

                const featured = Array.isArray(data)
                    ? data.filter((product) => product.isFeatured).slice(0, 4)
                    : [];

                setProducts(featured);
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <main>
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-tag">YOUR EVERYDAY MARKETPLACE</span>
                    <h1>
                        Discover products
                        <br />
                        you'll love.
                    </h1>
                    <p>
                        Explore quality products across fashion, electronics,
                        home essentials and more. Everything you need, in one place.
                    </p>
                    <Link to="/products" className="hero-button">
                        Explore Collection <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="hero-visual">
                    <div className="hero-circle">
                        <ShoppingBag size={100} strokeWidth={1} />
                    </div>
                    <span className="hero-floating">Shop smarter. Live better.</span>
                </div>
            </section>

            <section className="categories-section">
                <div className="section-heading">
                    <div>
                        <span className="section-label">EXPLORE</span>
                        <h2>Shop by Category</h2>
                    </div>
                    <Link to="/products" className="view-all">
                        View all <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="category-grid">
                    {categories.map((category) => (
                        <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="category-card"
                            key={category.name}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <h3>{category.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="home-products">
                <div className="section-heading">
                    <div>
                        <span className="section-label">OUR COLLECTION</span>
                        <h2>Popular Products</h2>
                    </div>
                    <Link to="/products" className="view-all">
                        Shop now <ArrowRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="products-placeholder">
                        <p>Loading popular products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="products-placeholder">
                        <ShoppingBag size={42} />
                        <p>No featured products available right now.</p>
                        <Link to="/products">Browse all products</Link>
                    </div>
                ) : (
                    <div className="product-grid home-product-grid">
                        {products.map((product) => (
                            <Link
                                to={`/products/${product._id}`}
                                className="product-card"
                                key={product._id}
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <span className="featured-badge">Featured</span>
                                </div>

                                <div className="product-info">
                                    <span className="product-category">
                                        {product.category}
                                    </span>
                                    <h3>{product.name}</h3>
                                    <p className="product-brand">{product.brand}</p>

                                    <div className="product-card-bottom">
                                        <strong>
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </strong>
                                        <span>
                                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </div>

                                    <span className="home-view-product">
                                        View Product <ArrowRight size={15} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="benefits-section">
                <div className="benefit">
                    <Truck size={28} />
                    <div>
                        <h3>Fast Delivery</h3>
                        <p>Reliable delivery to your doorstep</p>
                    </div>
                </div>

                <div className="benefit">
                    <ShieldCheck size={28} />
                    <div>
                        <h3>Secure Shopping</h3>
                        <p>Your information stays protected</p>
                    </div>
                </div>

                <div className="benefit">
                    <Headphones size={28} />
                    <div>
                        <h3>Customer Support</h3>
                        <p>We're here whenever you need us</p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
