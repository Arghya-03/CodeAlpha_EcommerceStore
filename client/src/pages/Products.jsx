
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import API from "../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const category = searchParams.get("category") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = `${product.name} ${product.category} ${product.brand}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        !category || product.category.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <main className="products-page">
      <div className="products-header">
        <div>
          <span className="section-label">SHOP THE COLLECTION</span>
          <h1>Explore Products</h1>
          <p>Find something you'll love.</p>
        </div>
        <span className="product-count">{filteredProducts.length} products</span>
      </div>

      <div className="product-toolbar">
        <div className="product-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-control">
          <SlidersHorizontal size={18} />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="products-message">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="products-message">
          <ShoppingBag size={40} />
          <h3>No products found</h3>
          <p>Try another search or category.</p>
          <Link to="/products">View all products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <Link
              to={`/products/${product._id}`}
              className="product-card"
              key={product._id}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.isFeatured && (
                  <span className="featured-badge">Featured</span>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <div className="product-card-bottom">
                  <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                  <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Products;
