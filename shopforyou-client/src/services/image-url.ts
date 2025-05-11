import noImagePlaceholder from "../assets/no-image-placeholder-6f3882e0.webp";

const getCroppedImageUrl = (url: string | null) => {
  if (!url) return noImagePlaceholder;

  // Convert any Google Drive URL to Direct Image URL
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : null;
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }

  return url; // For other URLs, use them as is.
};

export default getCroppedImageUrl;