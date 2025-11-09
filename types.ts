
export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  uploadedFiles: { name: string; type: string }[];
  timestamp: number;
}
