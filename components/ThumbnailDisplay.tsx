
import React from 'react';
import { YOUTUBE_THUMBNAIL_WIDTH, YOUTUBE_THUMBNAIL_HEIGHT } from '../constants';

interface ThumbnailDisplayProps {
  imageUrl: string | null;
  onRegenerate: () => void;
  isLoading: boolean;
}

const ThumbnailDisplay: React.FC<ThumbnailDisplayProps> = ({ imageUrl, onRegenerate, isLoading }) => {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `youtube-thumbnail-${Date.now()}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Thumbnail</h2>
      {imageUrl ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[500px] mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt="Generated YouTube Thumbnail"
              className="w-full h-auto object-cover"
              style={{ aspectRatio: `${YOUTUBE_THUMBNAIL_WIDTH}/${YOUTUBE_THUMBNAIL_HEIGHT}` }}
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              16:9 Aspect Ratio
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Recommended size for YouTube thumbnails is {YOUTUBE_THUMBNAIL_WIDTH}x{YOUTUBE_THUMBNAIL_HEIGHT}px.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Download Image
            </button>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className={`px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Regenerate
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">Your generated thumbnail will appear here.</p>
          <p className="text-sm mt-2">
            Enter a prompt and click "Generate Thumbnail" to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default ThumbnailDisplay;
