
// @ts-nocheck
// Disabling TypeScript checks for this file because jsPDF and html2canvas are loaded from CDN and don't have types available in this context.

export const exportToPdf = async (elementId: string, fileName: string): Promise<void> => {
  const { jsPDF } = window.jspdf;
  const input = document.getElementById(elementId);

  if (!input) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true, 
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in points: 595.28 x 841.89
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / canvasHeight;
    const imgWidth = pdfWidth - 40; // with some margin
    const imgHeight = imgWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 20;

    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 40);

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 40);
    }
    
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
