// Design Ref: §5.1 — Variant-aware option selector with out-of-stock display
const COLOR_MAP = { Black: '#000', White: '#fff', Navy: '#1a237e', Grey: '#9e9e9e', Charcoal: '#424242', Khaki: '#c3b091', Camel: '#c19a6b', Olive: '#556b2f', Tan: '#d2b48c', Brown: '#795548' };

function getAvailableValues(optionName, selectedSoFar, variants) {
  if (!variants?.length) return [];
  return variants
    .filter(v => {
      const opts = v.options instanceof Map ? Object.fromEntries(v.options) : v.options;
      return Object.entries(selectedSoFar).every(([k, val]) => opts[k] === val);
    })
    .map(v => {
      const opts = v.options instanceof Map ? Object.fromEntries(v.options) : v.options;
      return { value: opts[optionName], stock: v.stock, price: v.price };
    })
    .filter((item, i, arr) => arr.findIndex(a => a.value === item.value) === i || item.stock > 0)
    .reduce((acc, item) => {
      const existing = acc.find(a => a.value === item.value);
      if (existing) {
        existing.stock += item.stock;
        existing.price = Math.min(existing.price, item.price);
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
}

function findMatchingVariant(selectedOptions, variants) {
  if (!variants?.length) return null;
  return variants.find(v => {
    const opts = v.options instanceof Map ? Object.fromEntries(v.options) : v.options;
    return Object.entries(selectedOptions).every(([k, val]) => opts[k] === val);
  });
}

export default function OptionSelector({ options, variants, selectedOptions, onChange, onVariantSelect }) {
  const hasVariants = variants?.length > 0;

  const select = (name, value) => {
    const newSelected = { ...selectedOptions, [name]: value };
    onChange(newSelected);

    if (hasVariants && onVariantSelect) {
      const allSelected = options?.every(opt => newSelected[opt.name]);
      if (allSelected) {
        onVariantSelect(findMatchingVariant(newSelected, variants));
      } else {
        onVariantSelect(null);
      }
    }
  };

  return options?.map((opt) => {
    // Build availability info for this option
    const selectedSoFar = {};
    for (const o of options) {
      if (o.name === opt.name) break;
      if (selectedOptions[o.name]) selectedSoFar[o.name] = selectedOptions[o.name];
    }
    const availability = hasVariants ? getAvailableValues(opt.name, selectedSoFar, variants) : [];
    const getStock = (value) => availability.find(a => a.value === value)?.stock ?? null;

    return (
      <div key={opt.name} className="product-detail__option">
        <label className="label-sm">
          {opt.name}{selectedOptions[opt.name] ? ` — ${selectedOptions[opt.name]}` : ''}
        </label>
        <div className="product-detail__option-values">
          {opt.name === 'Color' ? (
            opt.values.map((v) => {
              const stock = getStock(v);
              const outOfStock = hasVariants && stock === 0;
              return (
                <button
                  key={v}
                  className={`product-detail__color-swatch ${selectedOptions[opt.name] === v ? 'active' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                  style={{ backgroundColor: COLOR_MAP[v] || '#ccc', border: v === 'White' ? '1px solid rgba(0,0,0,0.15)' : 'none' }}
                  onClick={() => !outOfStock && select(opt.name, v)}
                  disabled={outOfStock}
                  title={outOfStock ? `${v} — Out of Stock` : v}
                />
              );
            })
          ) : (
            opt.values.map((v) => {
              const stock = getStock(v);
              const outOfStock = hasVariants && stock === 0;
              return (
                <button
                  key={v}
                  className={`product-detail__option-btn ${selectedOptions[opt.name] === v ? 'active' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => !outOfStock && select(opt.name, v)}
                  disabled={outOfStock}
                >
                  {v}{outOfStock ? ' — Out of Stock' : ''}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  });
}
