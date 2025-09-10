import React from 'react';
import { LayoutRect, PageLayout } from '../types';

interface ImageTileProps {
  rect: LayoutRect;
  page: PageLayout;
  pageIndex: number;
  rectIndex: number;
  onTileClick: (pageIndex: number, rectIndex: number) => void;
  isSelected: boolean;
}

const ImageTile: React.FC<ImageTileProps> = ({ rect, page, pageIndex, rectIndex, onTileClick, isSelected }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${(rect.x / page.width) * 100}%`,
    top: `${(rect.y / page.height) * 100}%`,
    width: `${(rect.width / page.width) * 100}%`,
    height: `${(rect.height / page.height) * 100}%`,
    overflow: 'hidden',
    cursor: 'pointer',
  };
  
  const handleClick = () => {
    onTileClick(pageIndex, rectIndex);
  };

  return (
    <div
      style={style}
      onClick={handleClick}
      className={`transition-all duration-200 ${isSelected ? 'ring-4 ring-cyan-400 ring-inset z-10' : ''}`}
    >
      <img
        src={rect.image.url}
        alt={rect.image.file.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ImageTile;