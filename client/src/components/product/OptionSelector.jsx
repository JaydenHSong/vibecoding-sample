const COLOR_MAP = { Black: '#000', White: '#fff', Navy: '#1a237e', Grey: '#9e9e9e', Charcoal: '#424242', Khaki: '#c3b091', Camel: '#c19a6b', Olive: '#556b2f', Tan: '#d2b48c', Brown: '#795548' };

export default function OptionSelector({ options, selectedOptions, onChange }) {
  const select = (name, value) => onChange({ ...selectedOptions, [name]: value });

  return options?.map((opt) => (
    <div key={opt.name} className="product-detail__option">
      <label className="label-sm">{opt.name}{selectedOptions[opt.name] ? ` — ${selectedOptions[opt.name]}` : ''}</label>
      <div className="product-detail__option-values">
        {opt.name === 'Color' ? (
          opt.values.map((v) => (
            <button
              key={v}
              className={`product-detail__color-swatch ${selectedOptions[opt.name] === v ? 'active' : ''}`}
              style={{ backgroundColor: COLOR_MAP[v] || '#ccc', border: v === 'White' ? '1px solid rgba(0,0,0,0.15)' : 'none' }}
              onClick={() => select(opt.name, v)}
              title={v}
            />
          ))
        ) : (
          opt.values.map((v) => (
            <button key={v} className={`product-detail__option-btn ${selectedOptions[opt.name] === v ? 'active' : ''}`} onClick={() => select(opt.name, v)}>
              {v}
            </button>
          ))
        )}
      </div>
    </div>
  ));
}
