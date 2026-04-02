import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";
import { cn } from "@orafi/ui";

interface ImageGalleryProps {
  images: string[];
}

const WALRUS_GATEWAY =
  "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasMultipleImages = images.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative group w-full h-[400px] bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <div className="w-full h-full relative bg-gray-50 overflow-hidden">
            <img
              src={`${WALRUS_GATEWAY}/${images[currentIndex]}`}
              alt={`Payment link image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <FiShoppingBag className="w-32 h-32 text-gray-200" />
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-md border overflow-hidden transition-all",
                index === currentIndex
                  ? "border-orange-500 ring-1 ring-orange-500"
                  : "border-gray-200 hover:border-orange-300"
              )}
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <img
                  src={`${WALRUS_GATEWAY}/${images[index]}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
