import { Masonry } from 'masonic';
import { motion } from 'framer-motion';

interface StickerProduct {
  name: string;
  desc?: string;
  imageUrl: string;
}

interface StickerMasonryGridProps {
  products: StickerProduct[];
  onProductClick?: (product: StickerProduct) => void;
}

// 이미지 비율을 기반으로 높이 계산
const getImageHeight = (width: number, imageUrl: string): number => {
  // 기본값: 정사각형 (1:1)
  let ratio = 1;
  
  // URL 패턴으로 이미지 비율 추정
  if (imageUrl.includes('masonry-01') || imageUrl.includes('masonry-02') || 
      imageUrl.includes('masonry-04') || imageUrl.includes('masonry-05') ||
      imageUrl.includes('masonry-10') || imageUrl.includes('masonry-11')) {
    // 가로형 이미지 (3:2)
    ratio = 2 / 3;
  } else if (imageUrl.includes('masonry-03') || imageUrl.includes('masonry-06') || 
             imageUrl.includes('masonry-07') || imageUrl.includes('masonry-08') ||
             imageUrl.includes('masonry-09') || imageUrl.includes('masonry-12')) {
    // 세로형 이미지 (2:3)
    ratio = 3 / 2;
  }
  
  return width * ratio;
};

const StickerCard = ({ 
  index, 
  data: product, 
  width,
  onProductClick 
}: {
  index: number;
  data: StickerProduct;
  width: number;
  onProductClick?: (product: StickerProduct) => void;
}) => {
  const height = getImageHeight(width, product.imageUrl);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#e5e5e7] relative cursor-pointer"
      onClick={() => onProductClick?.(product)}
      style={{
        height: `${height}px`,
      }}
    >
      {/* Product Image */}
      <div className="w-full h-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Hover Overlay with Text Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
        <h3 className="text-white font-bold text-xs leading-tight line-clamp-2">
          {product.name}
        </h3>
        {product.desc && (
          <p className="text-gray-200 text-[10px] leading-tight line-clamp-2 mt-1">
            {product.desc}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export function StickerMasonryGrid({ products, onProductClick }: StickerMasonryGridProps) {
  return (
    <div className="w-full">
      <Masonry
        items={products}
        columnCount={4}
        columnGutter={12}
        rowGutter={12}
        overscanBy={5}
        render={({ index, data, width }) => (
          <StickerCard
            key={`${data.name}-${index}`}
            index={index}
            data={data}
            width={width}
            onProductClick={onProductClick}
          />
        )}
      />
    </div>
  );
}
