import React, { useEffect, useMemo, useState } from 'react';
import { RiAddLine, RiSearchLine } from 'react-icons/ri';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import '../styles/pos.css';


const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
}).format(Number(value || 0));

const POS = () => {
    const [search, setSearch] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('all');

    const { addToCart } = useCart();

    const [categories, setCategories] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // fetch categories once
    useEffect(() => {
        let cancelled = false;
        api.get('/categories')
            .then(res => {
                if (!cancelled) setCategories(res.data.data || []);
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, []);

    const fetchMedicines = () => {
        setIsError(false);
        setIsLoading(true);
        api.get('/medicines')
            .then(res => {
                setMedicines(res.data.data || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load medicines', err);
                setIsError(true);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const categoryOptions = useMemo(
        () => [{ _id: 'all', name: 'All Categories' }, ...categories],
        [categories]
    );

    const normalizedMedicines = useMemo(
        () => medicines.map((med) => ({
            ...med,
            quantity: Number(med.quantity ?? med.stock ?? 0),
            unitPrice: Number(med.unitPrice ?? med.price ?? 0),
            categoryName: med.category || med.categoryId?.name || 'Others',
        })),
        [medicines]
    );

    const filteredMedicines = useMemo(() => {
        const s = search.trim().toLowerCase();
        const b = brand.trim().toLowerCase();
        return normalizedMedicines.filter((m) => {
            const matchSearch =
                !s ||
                m.name.toLowerCase().includes(s) ||
                (m.brand && m.brand.toLowerCase().includes(s)) ||
                (m.categoryName && m.categoryName.toLowerCase().includes(s));
            const matchBrand = !b || (m.brand && m.brand.toLowerCase().includes(b));
            const matchCategory =
                category === 'all' || m.categoryName === category;
            return matchSearch && matchBrand && matchCategory;
        });
    }, [normalizedMedicines, search, brand, category]);



    const handleAddToCart = (medicine) => {
        addToCart(medicine);
    };


    return (
        <div className="pos-pro-shell">
            <section className="pos-main-layout">
                <div className="pos-left-col">
                    <div className="pos-card">
                        <div className="pos-card-head">
                            <h2>Medicines</h2>
                            <p>Search, filter and add items to cart</p>
                        </div>

                        <div className="pos-search-advanced">
                            <div className="pos-search-row">
                                <div className="pos-search-field pos-search-row-main">
                                    <RiSearchLine size={20} color="var(--primary-light)" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by medicine name, brand or category..."
                                        className="premium-search-input"
                                    />
                                </div>
                                <div className="pos-brand-field">
                                    <input
                                        className="premium-search-input"
                                        style={{ paddingLeft: '1.25rem' }}
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="Filter by brand"
                                    />
                                </div>
                            </div>
                            
                            <div className="pos-category-pills">
                                {categoryOptions.map((item) => (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => setCategory(item._id)}
                                        className={`pos-category-pill ${category === item._id ? 'active' : ''}`}
                                        style={{
                                            borderColor: category === item._id ? 'var(--primary)' : 'var(--glass-border)',
                                            background: category === item._id ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                            color: category === item._id ? 'var(--primary-light)' : 'var(--text-soft)',
                                        }}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pos-card">
                        <div className="pos-medicine-grid">
                            {isLoading && (
                                <p className="pos-empty-text">Loading medicines...</p>
                            )}
                            {isError && (
                                <div className="pos-empty-text">
                                    <p>Could not load medicines.</p>
                                    <button
                                        type="button"
                                        className="premium-btn ghost"
                                        onClick={fetchMedicines}
                                    >Retry</button>
                                </div>
                            )}
                            {!isLoading && !isError && filteredMedicines.map((medicine) => (
                                <article className="pos-med-card checkout-card" key={medicine._id} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)' }}>
                                    <div className="pos-med-card-head">
                                        <div className="pos-title-block">
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-heading)', letterSpacing: '-0.3px' }}>{medicine.name}</h4>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-soft)', display: 'block', marginTop: '4px' }}>{medicine.brand || 'General'}</span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-light)', background: 'rgba(37, 99, 235, 0.08)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                                            {medicine.categoryName}
                                        </span>
                                    </div>

                                    <div className="pos-card-price-row">
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase' }}>Price</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#fff' }}>{formatCurrency(medicine.unitPrice)}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: medicine.quantity > 5 ? 'var(--text-soft)' : '#ef4444', marginTop: '4px' }}>
                                                {medicine.quantity > 0 ? `${medicine.quantity} in stock` : 'Out of stock'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddToCart(medicine)}
                                            disabled={medicine.quantity < 1}
                                            className="generate-btn-premium"
                                            style={{ height: '44px', minWidth: '100px', fontSize: '14px', borderRadius: '14px', margin: 0 }}
                                        >
                                            <RiAddLine size={20} />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {!isLoading && !isError && normalizedMedicines.length === 0 && (
                                <p className="pos-empty-text">No medicines found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default POS;
