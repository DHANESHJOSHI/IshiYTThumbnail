
import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ThumbnailDisplay from './components/ThumbnailDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generateThumbnail } from './services/geminiService';
import { Part } from '@google/genai';
import { GeneratedImage } from './types';
import { YOUTUBE_ASPECT_RATIO, YOUTUBE_THUMBNAIL_HEIGHT, YOUTUBE_THUMBNAIL_WIDTH } from './constants';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentThumbnails, setRecentThumbnails] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    try {
      const storedThumbnails = localStorage.getItem('recentThumbnails');
      if (storedThumbnails) {
        setRecentThumbnails(JSON.parse(storedThumbnails));
      }
    } catch (e) {
      console.error("Failed to load recent thumbnails from localStorage", e);
    }
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleImagesSelected = useCallback((files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URI scheme prefix (e.g., "data:image/jpeg;base64,")
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a text prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const imageParts: Part[] = [];
      for (const file of selectedFiles) {
        const base64Data = await fileToBase64(file);
        imageParts.push({
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        });
      }

      const craftedPrompt = `Create a compelling YouTube thumbnail image with a modern, professional, and eye-catching aesthetic. The main topic is: "${prompt}". The image should be suitable for a ${YOUTUBE_ASPECT_RATIO} aspect ratio (e.g., ${YOUTUBE_THUMBNAIL_WIDTH}x${YOUTUBE_THUMBNAIL_HEIGHT}px). If provided, visually incorporate these uploaded images or elements described from them: ${selectedFiles.map(f => f.name).join(', ') || 'no additional images'}. Ensure the text is clear and readable, and the overall composition is balanced and engaging.`;

      const imageUrl = await generateThumbnail({
        prompt: craftedPrompt,
        imageParts: imageParts,
      });
      setGeneratedImageUrl(imageUrl);

      const newThumbnail: GeneratedImage = {
        imageUrl,
        prompt,
        uploadedFiles: selectedFiles.map(f => ({ name: f.name, type: f.type })),
        timestamp: Date.now(),
      };

      setRecentThumbnails(prev => {
        const updatedThumbnails = [newThumbnail, ...prev.slice(0, 4)]; // Keep up to 5 recent
        localStorage.setItem('recentThumbnails', JSON.stringify(updatedThumbnails));
        return updatedThumbnails;
      });

    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedFiles]);

  const handleRegenerate = useCallback(() => {
    setGeneratedImageUrl(null);
    setError(null);
    // Keep current prompt and selected files, user can modify if needed.
  }, []);

  const loadRecentThumbnail = useCallback((thumbnail: GeneratedImage) => {
    setPrompt(thumbnail.prompt);
    setGeneratedImageUrl(thumbnail.imageUrl);
    setSelectedFiles([]); // We don't store the actual files for recent thumbnails, just their names.
    setError(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center py-6 mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 leading-tight">
          AI YouTube Thumbnail Generator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Craft engaging thumbnails with a simple prompt and optional images.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form Section */}
        <section className="col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Inputs</h2>
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Text Prompt (e.g., "Integrating GraphQL with NestJS")
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
              placeholder="Describe your thumbnail: e.g., 'A futuristic city skyline with flying cars and neon lights, suitable for a tech review video.'"
              value={prompt}
              onChange={handlePromptChange}
              disabled={isLoading}
            ></textarea>
          </div>

          <ImageUploader
            onImagesSelected={handleImagesSelected}
            selectedFiles={selectedFiles}
            clearFiles={clearSelectedFiles}
          />

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 bg-white md:bg-transparent pb-4 md:pb-0 pt-4 md:pt-0">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                ${isLoading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Generating...' : 'Generate Thumbnail'}
            </button>
          </div>
        </section>

        {/* Output Display Section */}
        <section className="col-span-1">
          {isLoading && <LoadingSpinner />}
          <ThumbnailDisplay
            imageUrl={generatedImageUrl}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Recent Thumbnails Section */}
      {recentThumbnails.length > 0 && (
        <section className="w-full max-w-4xl mt-8 p-6 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Thumbnails</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentThumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => loadRecentThumbnail(thumbnail)}
              >
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-md overflow-hidden mb-2">
                  <img src={thumbnail.imageUrl} alt={`Thumbnail for ${thumbnail.prompt}`} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-medium text-gray-700 truncate mb-1">
                  {thumbnail.prompt}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(thumbnail.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="w-full max-w-4xl text-center py-6 mt-8 text-gray-500 text-sm">
        <p>
          Powered by Google Gemini API. Created with React and Tailwind CSS.
        </p>
        <p className="mt-1">
          For API key selection and billing information, please visit{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            ai.google.dev/gemini-api/docs/billing
          </a>.
        </p>
      </footer>
    </div>
  );
};

export default App;
