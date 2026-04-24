import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";
import { cn } from "@orafi/ui";

interface ImageGalleryProps {
  images: string[];
  mode: "live" | "test";
}

const WALRUS_GATEWAY_TESTNET = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";
const WALRUS_GATEWAY_MAINNET = "https://aggregator.walrus-mainnet.walrus.space/v1/blobs";
const ImageGallery = ({ images, mode }: ImageGalleryProps) => {
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
      <div className="relative group w-full h-[400px] bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <div className="w-full h-full relative bg-gray-50 overflow-hidden">
            <img
              src={`${mode == "live" ? WALRUS_GATEWAY_MAINNET : WALRUS_GATEWAY_TESTNET}/${images[currentIndex]}`}
              alt={`Paylink image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-gray-400">
            <FiShoppingBag className="w-20 h-20 text-gray-200" />
            <span className="text-sm font-medium">No image available</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prevImage(); }}
              aria-label="Previous image"
              title="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              aria-label="Next image"
              title="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-18 h-18 rounded-xl border overflow-hidden transition-all",
                index === currentIndex
                  ? "border-blue-950 ring-1 ring-blue-950"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <img
                  src={`${mode == "live" ? WALRUS_GATEWAY_MAINNET : WALRUS_GATEWAY_TESTNET}/${image}`}
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
