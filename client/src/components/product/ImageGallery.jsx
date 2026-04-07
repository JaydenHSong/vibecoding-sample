import { useState } from 'react';

export default function ImageGallery({ images, name }) {
  const [selected, setSelected] = useState(0);
  const imgs = images?.length ? images : ['https://placehold.co/800x1066/f3f3f3/ccc?text=No+Image'];

  return (
    <div className="product-detail__gallery">
      <div className="product-detail__gallery-scroll">
        {imgs.map((img, i) => (
          <div key={i} className={`product-detail__gallery-item ${i === selected ? 'active' : ''}`} onClick={() => setSelected(i)}>
            <img src={img} alt={`${name} ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="product-detail__main-image">
        <img src={imgs[selected]} alt={name} />
      </div>
    </div>
  );
}
