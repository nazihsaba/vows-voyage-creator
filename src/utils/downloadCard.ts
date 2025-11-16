import html2canvas from 'html2canvas';

export const downloadCardAsImage = async (
  elementId: string,
  fileName: string = 'bachelor-party-card.png'
): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error('Element not found');
  }

  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images
      logging: false,
      backgroundColor: null,
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error downloading card:', error);
    throw error;
  }
};
