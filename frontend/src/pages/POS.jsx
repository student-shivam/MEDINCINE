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

                        <div className="pos-search-line pos-search-advanced">
                            <div className="pos-search-field">
                                <RiSearchLine size={18} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search medicines, brand or category"
                                />
                            </div>

                            <input
                                className="pos-brand-input"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="Brand / Manufacturer"
                            />

                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categoryOptions.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
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
                                <article className="pos-med-card" key={medicine._id}>
                                    <div className="pos-med-card-head">
                                        <h4>{medicine.name}</h4>
                                        <span className="pill pill-green">{medicine.categoryName}</span>
                                    </div>
                                    <p className="pos-med-brand">{medicine.brand || '—'} • Stock {medicine.quantity}</p>
                                    <div className="pos-med-meta">
                                        <div>
                                            <strong>{formatCurrency(medicine.unitPrice)}</strong>
                                            <small>MRP</small>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddToCart(medicine)}
                                            disabled={medicine.quantity < 1}
                                        >
                                            <RiAddLine /> Add
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
