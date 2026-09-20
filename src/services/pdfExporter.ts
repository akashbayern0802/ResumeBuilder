import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Checks whether a specific horizontal row of pixels on the canvas contains only whitespace.
 */
function isRowWhitespace(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number
): boolean {
  if (y < 0) return true;
  try {
    // Sample across the content width (from 5% to 95% to avoid any border artifacts)
    const startX = Math.round(width * 0.05);
    const sampleWidth = Math.round(width * 0.90);
    const imgData = ctx.getImageData(startX, y, sampleWidth, 1).data;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      // If any pixel has non-white content (dark text or line)
      if (a > 50 && (r < 240 || g < 240 || b < 240)) {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Searches near the target cut line for the nearest pure whitespace row,
 * preventing any line of text or bullet point from being cut in half.
 */
function findNearestWhitespaceRow(
  ctx: CanvasRenderingContext2D,
  width: number,
  desiredY: number,
  minY: number,
  searchRange: number = 60
): number {
  // Check if desired position is already clean whitespace
  if (isRowWhitespace(ctx, width, desiredY)) {
    return desiredY;
  }

  // Scan upwards for the nearest blank gap between lines
  for (let offset = 1; offset <= searchRange; offset++) {
    const candidateY = desiredY - offset;
    if (candidateY <= minY + 150) break; // Keep a reasonable minimum page height
    if (isRowWhitespace(ctx, width, candidateY)) {
      return candidateY;
    }
  }

  // Fallback: scan slightly downwards if upwards had no gap
  for (let offset = 1; offset <= 20; offset++) {
    const candidateY = desiredY + offset;
    if (isRowWhitespace(ctx, width, candidateY)) {
      return candidateY;
    }
  }

  return desiredY;
}

/**
 * Directly downloads the resume element as a high-resolution PDF file.
 * Features smart content-aware page breaks:
 * 1. Measures DOM elements (headers, sections, bullet points) to detect straddling items.
 * 2. Shifts the page cut right before straddling bullet points or section headers.
 * 3. Scans canvas pixels to slice strictly at whitespace gaps between lines.
 * 4. Renders each slice onto an exact A4 page canvas with 300 DPI sharpness.
 */
export async function exportElementToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id ${elementId} not found, falling back to window.print()`);
    window.print();
    return;
  }

  try {
    // 1. Measure positions of all atomic blocks that should avoid being split
    const containerRect = element.getBoundingClientRect();
    const avoidElements: { top: number; bottom: number }[] = [];

    // Query candidate atomic elements: bullet points, headers, job items, and section blocks
    const candidates = element.querySelectorAll('li, h1, h2, h3, header, .resume-experience-item, section > div > div');
    candidates.forEach(child => {
      const rect = child.getBoundingClientRect();
      const top = rect.top - containerRect.top;
      const bottom = rect.bottom - containerRect.top;
      // Only track elements with measurable height
      if (bottom - top > 8) {
        avoidElements.push({ top, bottom });
      }
    });

    // 2. Render element to high-res canvas (2x scale for 300 DPI sharpness)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY
    });

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not obtain canvas 2D rendering context');
    }

    // 3. Map DOM avoid elements to canvas coordinates
    const scaleY = canvas.height / element.scrollHeight;
    const canvasAvoidZones = avoidElements.map(e => ({
      top: Math.round(e.top * scaleY),
      bottom: Math.round(e.bottom * scaleY)
    }));

    // Standard A4 dimensions
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const A4_ASPECT_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142857
    const idealPageHeightPx = Math.round(canvas.width * A4_ASPECT_RATIO);

    // 4. Calculate smart page slices
    let currentStartY = 0;
    const pageSlices: { startY: number; endY: number }[] = [];

    while (currentStartY < canvas.height) {
      const remainingHeight = canvas.height - currentStartY;

      // If the remaining content fits on the current page, take it all
      if (remainingHeight <= idealPageHeightPx) {
        pageSlices.push({ startY: currentStartY, endY: canvas.height });
        break;
      }

      // Calculate the ideal cut line
      const idealCutY = currentStartY + idealPageHeightPx;
      let targetCutY = idealCutY;

      // Check if any bullet point or header straddles the ideal cut line
      const straddling = canvasAvoidZones.find(
        zone => zone.top < idealCutY && zone.bottom > idealCutY && (idealCutY - zone.top) < (idealPageHeightPx * 0.40)
      );

      if (straddling) {
        // Move the cut right before this element so it flows cleanly to the next page
        targetCutY = Math.max(currentStartY + Math.round(idealPageHeightPx * 0.5), straddling.top - 4);
      }

      // Fine-tune target cut to land on a row of pure white pixels (between lines/paragraphs)
      targetCutY = findNearestWhitespaceRow(ctx, canvas.width, targetCutY, currentStartY, 60);

      pageSlices.push({ startY: currentStartY, endY: targetCutY });
      currentStartY = targetCutY;
    }

    // 5. Build the multi-page A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < pageSlices.length; i++) {
      const slice = pageSlices[i];
      const sliceHeightPx = slice.endY - slice.startY;

      // Create a page canvas sized exactly to A4
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = idealPageHeightPx;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        // Fill A4 background with crisp white
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw the slice at the top of the A4 page
        pageCtx.drawImage(
          canvas,
          0, slice.startY, canvas.width, sliceHeightPx,
          0, 0, canvas.width, sliceHeightPx
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageImgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

      // Cleanup page canvas
      pageCanvas.width = 0;
      pageCanvas.height = 0;
    }

    // 6. Save the generated PDF directly to downloads
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
  } catch (error) {
    console.error('Smart PDF export encountered an error, falling back to print dialog:', error);
    window.print();
  }
}
