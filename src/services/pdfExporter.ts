import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Standard A4 dimensions (in mm)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

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
export interface PdfRenderResult {
  pages: string[];
  pdf: jsPDF;
  totalPages: number;
}

/**
 * Renders the resume element into discrete high-resolution A4 page images and a jsPDF instance.
 * Allows interactive multi-page PDF previewing before downloading.
 */
export async function renderElementPdfPages(elementId: string): Promise<PdfRenderResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // 1. Discrete Multi-Sheet Architecture:
  // If the resume contains explicit .pdf-page elements, render each page directly with zero slicing artifacts!
  const pageElements = Array.from(element.querySelectorAll<HTMLElement>('.pdf-page'));
  if (pageElements.length > 0) {
    const pageImages: string[] = [];
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        onclone: (_clonedDoc, clonedElement) => {
          let curr: HTMLElement | null = clonedElement;
          while (curr) {
            if (curr.style.transform && curr.style.transform !== 'none') {
              curr.style.transform = 'none';
            }
            curr = curr.parentElement;
          }
        }
      });

      // Preserve natural aspect ratio and avoid horizontal or vertical stretching
      const canvasAspect = canvas.height / canvas.width;
      const a4Aspect = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142857

      let pageCanvas = canvas;

      // If the rendered sheet's aspect ratio differs from A4, fit onto exact A4 aspect ratio canvas
      if (Math.abs(canvasAspect - a4Aspect) > 0.01) {
        const targetWidth = canvas.width;
        const targetHeight = Math.round(canvas.width * a4Aspect);

        if (canvas.height > targetHeight * 1.02 && canvas.height <= targetHeight * 1.30) {
          // Moderate overflow (up to 30%): smoothly fit all content onto this page so nothing (like Achievements) is cut off
          const fittedCanvas = document.createElement('canvas');
          fittedCanvas.width = targetWidth;
          fittedCanvas.height = targetHeight;
          const fCtx = fittedCanvas.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = '#ffffff';
            fCtx.fillRect(0, 0, targetWidth, targetHeight);
            fCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);
            pageCanvas = fittedCanvas;
          }
        } else if (canvas.height > targetHeight * 1.30) {
          // Significant overflow: paginate across multiple pages so no content is dropped
          let currentY = 0;
          while (currentY < canvas.height) {
            const remainingHeight = canvas.height - currentY;
            const sliceHeight = Math.min(targetHeight, remainingHeight);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = targetWidth;
            sliceCanvas.height = targetHeight;
            const sCtx = sliceCanvas.getContext('2d');
            if (sCtx) {
              sCtx.fillStyle = '#ffffff';
              sCtx.fillRect(0, 0, targetWidth, targetHeight);
              sCtx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            }
            const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
            pageImages.push(sliceImgData);
            if (pageImages.length > 1) {
              pdf.addPage();
            }
            pdf.addImage(sliceImgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
            currentY += sliceHeight;
          }
          continue;
        } else {
          // Under A4 height: pad bottom with clean white space
          const fittedCanvas = document.createElement('canvas');
          fittedCanvas.width = targetWidth;
          fittedCanvas.height = targetHeight;
          const fCtx = fittedCanvas.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = '#ffffff';
            fCtx.fillRect(0, 0, targetWidth, targetHeight);
            fCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            pageCanvas = fittedCanvas;
          }
        }
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      pageImages.push(pageImgData);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageImgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
    }

    return {
      pages: pageImages,
      pdf,
      totalPages: pageElements.length
    };
  }

  const isTwoPageFit = element.getAttribute('data-fit-two-pages') === 'true' ||
    element.classList.contains('fit-two-pages');

  // Fallback: Measure positions of only small atomic items (under 55px) using unscaled offsetTop
  const avoidElements: { top: number; bottom: number }[] = [];

  const candidates = element.querySelectorAll('li, h1, h2, h3, .break-inside-avoid');
  candidates.forEach(child => {
    const htmlChild = child as HTMLElement;
    let offsetTop = 0;
    let curr: HTMLElement | null = htmlChild;
    while (curr && curr !== element) {
      offsetTop += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement;
    }
    const height = htmlChild.offsetHeight;
    // Strictly avoid atomic items (under 55px, e.g. single bullet point or heading)
    if (height >= 8 && height <= 55) {
      avoidElements.push({ top: offsetTop, bottom: offsetTop + height });
    }
  });

  // 2. Render element to high-res canvas (2x scale for 300 DPI sharpness)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1200,
    onclone: (_clonedDoc, clonedElement) => {
      // Ensure clonedElement and all its ancestors have unscaled transform during capture
      let curr: HTMLElement | null = clonedElement;
      while (curr) {
        if (curr.style.transform && curr.style.transform !== 'none') {
          curr.style.transform = 'none';
        }
        curr = curr.parentElement;
      }
    }
  });

  const A4_ASPECT_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142857
  const idealPageHeightPx = Math.round(canvas.width * A4_ASPECT_RATIO);

  // 3. Auto-fit to 2 pages if requested and within reasonable stretch (up to 2.35 pages)
  let activeCanvas = canvas;
  if (isTwoPageFit && canvas.height > (2 * idealPageHeightPx) && canvas.height <= Math.round(2.35 * idealPageHeightPx)) {
    const targetHeight = Math.round(2 * idealPageHeightPx - 20);
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width;
    scaledCanvas.height = targetHeight;
    const sCtx = scaledCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = '#ffffff';
      sCtx.fillRect(0, 0, scaledCanvas.width, targetHeight);
      sCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, targetHeight);
      activeCanvas = scaledCanvas;
    }
  }

  const ctx = activeCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not obtain canvas 2D rendering context');
  }

  // Map DOM avoid elements to canvas coordinates
  const scaleY = activeCanvas.height / (element.scrollHeight || element.offsetHeight || 1);
  const canvasAvoidZones = avoidElements.map(e => ({
    top: Math.round(e.top * scaleY),
    bottom: Math.round(e.bottom * scaleY)
  }));

  // 4. Calculate smart page slices
  const pageSlices: { startY: number; endY: number }[] = [];
  const maxShiftPx = Math.round(55 * scaleY); // At most the height of a single bullet point

  // If content fits on 1 page:
  if (activeCanvas.height <= idealPageHeightPx) {
    pageSlices.push({ startY: 0, endY: activeCanvas.height });
  } else if (isTwoPageFit && activeCanvas.height <= (2 * idealPageHeightPx + 20)) {
    // Fits in 2 pages: fill Page 1 as fully as possible down to idealPageHeightPx - 10
    const idealCut = idealPageHeightPx - 10;
    let targetCutY = idealCut;

    // Check if an atomic bullet point or header straddles idealCut
    const straddling = canvasAvoidZones.find(
      zone => zone.top < idealCut && zone.bottom > idealCut && (idealCut - zone.top) <= maxShiftPx
    );

    if (straddling) {
      targetCutY = straddling.top - 4;
    }

    // Scan for nearest clean blank gap (tight search range of 45px)
    targetCutY = findNearestWhitespaceRow(ctx, activeCanvas.width, targetCutY, idealCut - 55, 45);

    // Guarantee Page 2 does not overflow A4
    const minCutForPage2 = activeCanvas.height - idealPageHeightPx + 5;
    if (targetCutY < minCutForPage2) {
      targetCutY = minCutForPage2;
      targetCutY = findNearestWhitespaceRow(ctx, activeCanvas.width, targetCutY, minCutForPage2 - 20, 30);
    }

    // Ensure targetCutY does not exceed Page 1 limit
    targetCutY = Math.min(idealPageHeightPx - 5, targetCutY);

    pageSlices.push({ startY: 0, endY: targetCutY });
    pageSlices.push({ startY: targetCutY, endY: activeCanvas.height });
  } else {
    // Standard multi-page slicer: fill each page up to idealPageHeightPx - 10
    let currentStartY = 0;
    while (currentStartY < activeCanvas.height) {
      const remainingHeight = activeCanvas.height - currentStartY;

      if (remainingHeight <= idealPageHeightPx) {
        pageSlices.push({ startY: currentStartY, endY: activeCanvas.height });
        break;
      }

      const idealCutY = currentStartY + idealPageHeightPx - 10;
      let targetCutY = idealCutY;

      const straddling = canvasAvoidZones.find(
        zone => zone.top < idealCutY && zone.bottom > idealCutY && (idealCutY - zone.top) <= maxShiftPx
      );

      if (straddling) {
        targetCutY = straddling.top - 4;
      }

      targetCutY = findNearestWhitespaceRow(ctx, activeCanvas.width, targetCutY, idealCutY - 55, 45);

      pageSlices.push({ startY: currentStartY, endY: targetCutY });
      currentStartY = targetCutY;
    }
  }

  // 5. Build multi-page A4 PDF and collect page image data URLs
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageImages: string[] = [];

  for (let i = 0; i < pageSlices.length; i++) {
    const slice = pageSlices[i];
    const sliceHeightPx = slice.endY - slice.startY;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = activeCanvas.width;
    pageCanvas.height = idealPageHeightPx;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        activeCanvas,
        0, slice.startY, activeCanvas.width, sliceHeightPx,
        0, 0, activeCanvas.width, sliceHeightPx
      );
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
    pageImages.push(pageImgData);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageImgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

    pageCanvas.width = 0;
    pageCanvas.height = 0;
  }

  return {
    pages: pageImages,
    pdf,
    totalPages: pageSlices.length
  };
}

/**
 * Directly downloads the resume element as a high-resolution PDF file.
 */
export async function exportElementToPdf(elementId: string, filename: string): Promise<void> {
  try {
    const result = await renderElementPdfPages(elementId);
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    result.pdf.save(safeFilename);
  } catch (error) {
    console.error('Smart PDF export encountered an error, falling back to print dialog:', error);
    window.print();
  }
}
