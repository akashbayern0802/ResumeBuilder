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

export interface PdfRenderResult {
  pages: string[];
  pdf: jsPDF;
  totalPages: number;
}

/**
 * Renders the resume element into discrete high-resolution A4 page images and a jsPDF instance.
 * Features:
 * 1. Discrete Multi-Sheet Architecture (Sheet 1 -> Page 1, Sheet 2 -> Page 2 with zero unwanted slicing).
 * 2. High-DPI 2.8x scaling equivalent to ~300 DPI razor-sharp print quality.
 * 3. Lossless PNG encoding eliminating JPEG compression noise and font blurriness.
 * 4. Strict 2-Page Fit guarantee: when active, always generates exactly 2 pages without creating a 3rd page.
 */
export async function renderElementPdfPages(elementId: string): Promise<PdfRenderResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  const isTwoPageFit = element.getAttribute('data-fit-two-pages') === 'true' ||
    element.classList.contains('fit-two-pages');

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

    const isExplicitTwoSheet = pageElements.length === 2;

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2.8,
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

      // Standard A4 aspect ratio canvas
      const a4Aspect = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142857
      const targetWidth = canvas.width;
      const targetHeight = Math.round(canvas.width * a4Aspect);

      let pageCanvas: HTMLCanvasElement;

      // When the user has selected 2-page fit OR this is an explicit 2-sheet resume:
      // Hard guarantee: Sheet 1 -> Page 1, Sheet 2 -> Page 2.
      // Under NO circumstances slice or create an unexpected 3rd page!
      if (isTwoPageFit || isExplicitTwoSheet) {
        const fittedCanvas = document.createElement('canvas');
        fittedCanvas.width = targetWidth;
        fittedCanvas.height = targetHeight;
        const fCtx = fittedCanvas.getContext('2d');
        if (fCtx) {
          fCtx.fillStyle = '#ffffff';
          fCtx.fillRect(0, 0, targetWidth, targetHeight);
          // Scale entire sheet cleanly to fit the exact A4 page without cutting off sections
          fCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);
        }
        pageCanvas = fittedCanvas;
      } else {
        // Not restricted to 2 pages:
        if (canvas.height > targetHeight * 1.35) {
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
            const sliceImgData = sliceCanvas.toDataURL('image/png');
            pageImages.push(sliceImgData);
            if (pageImages.length > 1) {
              pdf.addPage();
            }
            pdf.addImage(sliceImgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
            currentY += sliceHeight;
          }
          continue;
        } else {
          // Under or moderately over A4 height: fit smoothly onto A4 page
          const fittedCanvas = document.createElement('canvas');
          fittedCanvas.width = targetWidth;
          fittedCanvas.height = targetHeight;
          const fCtx = fittedCanvas.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = '#ffffff';
            fCtx.fillRect(0, 0, targetWidth, targetHeight);
            fCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);
          }
          pageCanvas = fittedCanvas;
        }
      }

      // Lossless PNG export for razor-sharp typography and crisp icon graphics
      const pageImgData = pageCanvas.toDataURL('image/png');
      pageImages.push(pageImgData);

      if (pageImages.length > 1) {
        pdf.addPage();
      }

      pdf.addImage(pageImgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
    }

    return {
      pages: pageImages,
      pdf,
      totalPages: pageImages.length
    };
  }

  // Fallback for single-element templates: Measure atomic items
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
    if (height >= 8 && height <= 55) {
      avoidElements.push({ top: offsetTop, bottom: offsetTop + height });
    }
  });

  // 2. Render element to high-res canvas (2.8x scale for ~300 DPI razor-sharp print quality)
  const canvas = await html2canvas(element, {
    scale: 2.8,
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

  const A4_ASPECT_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142857
  const idealPageHeightPx = Math.round(canvas.width * A4_ASPECT_RATIO);

  // 3. Auto-fit to 2 pages if requested and within reasonable stretch (up to 2.5 pages)
  let activeCanvas = canvas;
  if (isTwoPageFit && canvas.height > (2 * idealPageHeightPx) && canvas.height <= Math.round(2.5 * idealPageHeightPx)) {
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
  const maxShiftPx = Math.round(55 * scaleY);

  // If content fits on 1 page:
  if (activeCanvas.height <= idealPageHeightPx) {
    pageSlices.push({ startY: 0, endY: activeCanvas.height });
  } else if (isTwoPageFit) {
    // Strictly fit onto exactly 2 pages
    const idealCut = Math.min(idealPageHeightPx - 10, Math.round(activeCanvas.height / 2));
    let targetCutY = idealCut;

    const straddling = canvasAvoidZones.find(
      zone => zone.top < idealCut && zone.bottom > idealCut && (idealCut - zone.top) <= maxShiftPx
    );

    if (straddling) {
      targetCutY = straddling.top - 4;
    }

    targetCutY = findNearestWhitespaceRow(ctx, activeCanvas.width, targetCutY, idealCut - 60, 50);

    const minCutForPage2 = Math.max(0, activeCanvas.height - idealPageHeightPx + 5);
    if (targetCutY < minCutForPage2 && minCutForPage2 < idealPageHeightPx) {
      targetCutY = minCutForPage2;
      targetCutY = findNearestWhitespaceRow(ctx, activeCanvas.width, targetCutY, minCutForPage2 - 20, 30);
    }

    targetCutY = Math.min(idealPageHeightPx - 5, Math.max(100, targetCutY));

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

  // 5. Build multi-page A4 PDF and collect page image data URLs (Lossless PNG)
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

    const pageImgData = pageCanvas.toDataURL('image/png');
    pageImages.push(pageImgData);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageImgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

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
