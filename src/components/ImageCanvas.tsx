import React, { useRef, useState } from 'react';
import { PageLayout } from '../types';
import ImageTile from './ImageTile';

declare var html2canvas: any;

interface ImageCanvasProps {
  pages: PageLayout[];
  onImageSwap: (pageIndex: number, sourceIndex: number, targetIndex: number) => void;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ pages, onImageSwap }) => {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [exportingPageIndex, setExportingPageIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ pageIndex: number; rectIndex: number } | null>(null);

  const handleTileClick = (pageIndex: number, rectIndex: number) => {
    if (selectedImage) {
      if (selectedImage.pageIndex === pageIndex) { // Click is on the same page
        if (selectedImage.rectIndex === rectIndex) { // Clicked the same image again
          setSelectedImage(null); // -> Deselect
        } else { // Clicked a different image on the same page
          onImageSwap(pageIndex, selectedImage.rectIndex, rectIndex); // -> Swap
          setSelectedImage(null); // -> and deselect
        }
      } else { // Click is on a different page
        setSelectedImage({ pageIndex, rectIndex }); // -> Change selection to the new image
      }
    } else { // No image selected yet
      setSelectedImage({ pageIndex, rectIndex }); // -> Select this image
    }
  };

  const handleExport = async (pageIndex: number, page: PageLayout) => {
    setExportingPageIndex(pageIndex);
    const pageElement = pageRefs.current[pageIndex];

    if (!pageElement) {
      console.error("Page element not found for export.");
      alert("Export fehlgeschlagen: Seiten-Element nicht gefunden.");
      setExportingPageIndex(null);
      return;
    }

    try {
      // Calculate target resolution for 300 ppi
      const ppi = 300;
      const mm_per_inch = 25.4;
      const targetWidthPx = Math.round((page.width / mm_per_inch) * ppi);
      const scale = targetWidthPx / pageElement.offsetWidth;

      console.log('Exporting page:', pageIndex);
      console.log('Page dimensions (mm):', page.width, 'x', page.height);
      console.log('On-screen element width (px):', pageElement.offsetWidth);
      console.log('Target pixel width (px):', targetWidthPx);
      console.log('Calculated scale:', scale);

      const canvas = await html2canvas(pageElement, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Use white background for export
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `bildkatalog-seite-${pageIndex + 1}-300ppi.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error("Export failed:", error);
      alert("Der Export ist fehlgeschlagen. Dies kann bei sehr großen Seiten oder Bildern passieren.");
    } finally {
      setExportingPageIndex(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="w-full max-w-4xl">
           <div className="flex justify-between items-center mb-2">
            <p className="text-left text-sm text-gray-400">Seite {pageIndex + 1}</p>
            <button
              onClick={() => handleExport(pageIndex, page)}
              disabled={exportingPageIndex !== null}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors"
            >
              {exportingPageIndex === pageIndex ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Export...
                </span>
              ) : (
                'Exportieren (300 ppi)'
              )}
            </button>
           </div>
           <div className="shadow-2xl bg-gray-800 p-2 rounded-lg">
            <div
              ref={el => { pageRefs.current[pageIndex] = el; }}
              className="relative bg-white"
              style={{
                width: '100%',
                aspectRatio: `${page.width} / ${page.height}`,
              }}
            >
              {page.layout.map((rect, rectIndex) => (
                <ImageTile
                  key={`${rect.image.file.name}-${rectIndex}`}
                  rect={rect}
                  page={page}
                  pageIndex={pageIndex}
                  rectIndex={rectIndex}
                  onTileClick={handleTileClick}
                  isSelected={selectedImage?.pageIndex === pageIndex && selectedImage?.rectIndex === rectIndex}
                />
              ))}
            </div>
           </div>
        </div>
      ))}
    </div>
  );
};

export default ImageCanvas;