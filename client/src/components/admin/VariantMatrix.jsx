// Design Ref: §5.3 — Admin Variant Matrix for SKU/price/stock per combination
import { useState, useEffect } from 'react';

function generateCombinations(options) {
  if (!options || options.length === 0) return [];
  const [first, ...rest] = options;
  if (!first.values?.length) return generateCombinations(rest);
  const restCombos = generateCombinations(rest);
  if (restCombos.length === 0) return first.values.map(v => ({ [first.name]: v }));
  const combos = [];
  for (const value of first.values) {
    for (const combo of restCombos) {
      combos.push({ [first.name]: value, ...combo });
    }
  }
  return combos;
}

function optionsKey(options) {
  return Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|');
}

const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)' };
const inputStyle = { width: '100%', padding: '6px 8px', fontSize: 13, border: '1px solid rgba(0,0,0,0.1)' };

export default function VariantMatrix({ options, variants, onChange, basePrice }) {
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const combos = generateCombinations(options);

  // Build variant map from existing data
  useEffect(() => {
    if (combos.length === 0) { onChange([]); return; }

    const existingMap = new Map();
    for (const v of variants) {
      const opts = v.options instanceof Map ? Object.fromEntries(v.options) : v.options;
      existingMap.set(optionsKey(opts), v);
    }

    // Only add new combos, keep existing data
    const hasNew = combos.some(c => !existingMap.has(optionsKey(c)));
    if (!hasNew && variants.length === combos.length) return;

    const updated = combos.map(combo => {
      const key = optionsKey(combo);
      const existing = existingMap.get(key);
      if (existing) return existing;
      const skuParts = Object.values(combo).map(v => v.toUpperCase().slice(0, 3));
      return {
        sku: skuParts.join('-'),
        price: basePrice || 0,
        stock: 0,
        options: combo
      };
    });
    onChange(updated);
  }, [JSON.stringify(options)]);

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: field === 'sku' ? value : Number(value) || 0 };
    onChange(updated);
  };

  const applyBulkPrice = () => {
    if (!bulkPrice) return;
    onChange(variants.map(v => ({ ...v, price: Number(bulkPrice) })));
    setBulkPrice('');
  };

  const applyBulkStock = () => {
    if (!bulkStock) return;
    onChange(variants.map(v => ({ ...v, stock: Number(bulkStock) })));
    setBulkStock('');
  };

  if (combos.length === 0) return null;

  const optionNames = options.filter(o => o.values?.length > 0).map(o => o.name);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ ...labelStyle, fontSize: 12, fontWeight: 900 }}>
          Variant Matrix ({combos.length} combinations)
        </span>
      </div>

      {/* Bulk actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="number" placeholder="Set all prices" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <button type="button" onClick={applyBulkPrice} style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>Apply</button>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="number" placeholder="Set all stock" value={bulkStock} onChange={e => setBulkStock(e.target.value)} style={{ ...inputStyle, width: 120 }} />
          <button type="button" onClick={applyBulkStock} style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>Apply</button>
        </div>
      </div>

      {/* Matrix table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
              {optionNames.map(name => (
                <th key={name} style={{ ...labelStyle, padding: '8px 6px', textAlign: 'left' }}>{name}</th>
              ))}
              <th style={{ ...labelStyle, padding: '8px 6px', textAlign: 'left' }}>SKU</th>
              <th style={{ ...labelStyle, padding: '8px 6px', textAlign: 'left' }}>Price</th>
              <th style={{ ...labelStyle, padding: '8px 6px', textAlign: 'left' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => {
              const opts = v.options instanceof Map ? Object.fromEntries(v.options) : v.options;
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  {optionNames.map(name => (
                    <td key={name} style={{ padding: '6px', fontWeight: 600, fontSize: 12 }}>{opts[name]}</td>
                  ))}
                  <td style={{ padding: '4px' }}>
                    <input value={v.sku || ''} onChange={e => updateVariant(i, 'sku', e.target.value)} style={{ ...inputStyle, textTransform: 'uppercase' }} />
                  </td>
                  <td style={{ padding: '4px' }}>
                    <input type="number" value={v.price || ''} onChange={e => updateVariant(i, 'price', e.target.value)} style={inputStyle} min="0" />
                  </td>
                  <td style={{ padding: '4px' }}>
                    <input type="number" value={v.stock || ''} onChange={e => updateVariant(i, 'stock', e.target.value)} style={inputStyle} min="0" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
