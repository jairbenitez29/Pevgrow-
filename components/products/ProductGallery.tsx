'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImage {
  id: number;
  name: string;
  original_url: string;
  thumbnail_url: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage].original_url}
          alt={`${productName} - ${images[selectedImage].name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition
                ${selectedImage === index ? 'border-purple-900' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <Image
                src={image.thumbnail_url}
                alt={image.name}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
