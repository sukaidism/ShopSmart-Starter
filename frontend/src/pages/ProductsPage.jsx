import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';

export default function ProductsPage() {
  // State variables for products, search query, category filter, loading status, and error message
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortCatalog, setSortCatalog] = useState("Default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, cartMessage } = useCart();

  useEffect(() => {
    let active = true;
    api.getProducts()
      .then((data) => active && setProducts(data.products))
      .catch((caught) => active && setError(caught.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products]
  );

  // Convert search value to lowercase
  const query = search.trim().toLowerCase();

  // Products filtered based on search and category
  /*
  const visibleProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(query) ||
                          product.description.toLowerCase().includes(query);
    
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });
  */

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const visibleProducts = [...filteredProducts];

  if (sortCatalog === 'Price-low-high') {
    visibleProducts.sort((ProductOne, ProductTwo) => 
      Number(ProductOne.price) - Number(ProductTwo.price)
    );
  }
  else if (sortCatalog === 'Price-high-low') {
    visibleProducts.sort((ProductOne, ProductTwo) => 
      Number(ProductTwo.price) - Number(ProductOne.price)
    );
  }
  else if (sortCatalog === 'Name-A-Z') {
    visibleProducts.sort((ProductOne, ProductTwo) =>
      ProductOne.name.localeCompare(ProductTwo.name)
    );
  }

  return (
    <section>
      <div className="hero">
        <div>
          <p className="eyebrow">BSIT FULL-STACK PROJECT</p>
          <h1>Technology for study, work and play</h1>
          <p>Browse the starter catalog, build a cart and complete a simulated order.</p>
        </div>
      </div>

      <div className="toolbar">
        <label>
          <span>Search products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try keyboard" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        
        <label>
          <span>Sort</span>
          <select value={sortCatalog} onChange={(event) => setSortCatalog(event.target.value)}>
            <option value="Default">Default</option>
            <option value="Price-low-high">Price: Low to High</option>
            <option value="Price-high-low">Price: High to Low</option>
            <option value="Name-A-Z">Name: A To Z</option>
          </select>
        </label>
        
      </div>

      <StatusMessage>{cartMessage}</StatusMessage>
      {loading && <StatusMessage>Loading products…</StatusMessage>}
      {error && <StatusMessage type="error">{error} Make sure the backend is running.</StatusMessage>}
      {!loading && !error && visibleProducts.length === 0 && <StatusMessage>No products match your filters.</StatusMessage>}

      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}
