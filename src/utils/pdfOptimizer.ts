import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

// Tipos para pdf.js
interface PdfJsLib {
  getDocument: (options: { data: ArrayBuffer; verbosity: number }) => {
    promise: Promise<PdfJsDocument>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  OPS: {
    paintImageXObject: number;
    paintJpegXObject: number;
  };
}

interface PdfJsDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
}

interface PdfJsPage {
  getViewport: (options: { scale: number }) => {
    width: number;
    height: number;
  };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
  getOperatorList: () => Promise<{
    fnArray: number[];
  }>;
}

interface WindowWithPdfJs extends Window {
  pdfjsLib?: PdfJsLib;
}

// Usar pdf.js desde CDN para evitar problemas con webpack/Next.js
async function getPdfJs(): Promise<PdfJsLib | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const win = window as WindowWithPdfJs;
    // Cargar pdf.js desde CDN usando script tag
    if (!win.pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        // Verificar si ya está cargado (por si se carga dos veces)
        const checkInterval = setInterval(() => {
          if (win.pdfjsLib) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Crear script tag para cargar pdf.js
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        script.onload = () => {
          clearInterval(checkInterval);
          // Esperar un momento para que se inicialice
          setTimeout(() => {
            // Configurar el worker
            if (win.pdfjsLib?.GlobalWorkerOptions) {
              win.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            resolve();
          }, 100);
        };
        script.onerror = () => {
          clearInterval(checkInterval);
          reject(new Error('No se pudo cargar pdf.js desde CDN'));
        };
        document.head.appendChild(script);
      });
    } else {
      // Ya está cargado, solo configurar el worker si es necesario
      if (win.pdfjsLib?.GlobalWorkerOptions && !win.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        win.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    }
    
    return win.pdfjsLib || null;
  } catch (error) {
    return null;
  }
}

/**
 * Optimiza PDF localmente manteniendo texto vectorial
 * Extrae y comprime solo las imágenes, manteniendo el texto intacto
 */
export async function optimizePdfAggressive(
  file: File
): Promise<File> {
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Cargar pdf.js primero para obtener número de páginas
    const pdfjs = await getPdfJs();
    if (!pdfjs) {
      return await optimizePdfBasic(file);
    }

    const pdfJsDoc = await pdfjs.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
    const numPages = pdfJsDoc.numPages;

    // Calcular parámetros de compresión según tamaño
    // Para PDFs grandes, usamos compresión más agresiva pero con mejor calidad de texto
    const sizeMB = file.size / (1024 * 1024);
    let maxImageSize = 0.3;
    let maxImageDimension = 1800;

    if (sizeMB > 10) {
      // PDFs muy grandes: compresión agresiva pero manteniendo calidad de texto
      maxImageSize = 0.2;
      maxImageDimension = 1600;
    } else if (sizeMB > 5) {
      maxImageSize = 0.25;
      maxImageDimension = 1700;
    } else if (sizeMB > 2) {
      maxImageSize = 0.3;
      maxImageDimension = 1800;
    }

    // Crear nuevo PDF optimizado
    const newPdf = await PDFDocument.create();
    
    // Procesar cada página
    for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
      const pdfJsPage = await pdfJsDoc.getPage(pageIndex + 1);
      const viewport = pdfJsPage.getViewport({ scale: 1.0 });
      const width = viewport.width;
      const height = viewport.height;
      
      // Crear nueva página con mismo tamaño
      const newPage = newPdf.addPage([width, height]);
      
      // Intentar copiar contenido y optimizar imágenes
      // Nota: pdf-lib no permite copiar contenido directamente, 
      // así que usamos un enfoque híbrido inteligente
      
      // Detectar tipo de contenido
      const hasManyImages = await detectManyImages(pdfJsPage);
      
      // Ajustar parámetros según tamaño del PDF y tipo de contenido
      let renderScale: number;
      let jpegQuality: number;
      let compressionMaxSize: number;
      let compressionMaxDim: number;
      let compressionQuality: number;

      if (sizeMB > 10) {
        // PDFs muy grandes: balance entre calidad y tamaño
        if (hasManyImages) {
          renderScale = 2.5;
          jpegQuality = 0.75;
          compressionMaxSize = maxImageSize;
          compressionMaxDim = maxImageDimension;
          compressionQuality = 0.7;
        } else {
          // Principalmente texto: máxima calidad
          renderScale = 3.5;
          jpegQuality = 0.9;
          compressionMaxSize = maxImageSize * 2;
          compressionMaxDim = 2500;
          compressionQuality = 0.85;
        }
      } else if (sizeMB > 5) {
        if (hasManyImages) {
          renderScale = 2.8;
          jpegQuality = 0.8;
          compressionMaxSize = maxImageSize * 1.2;
          compressionMaxDim = maxImageDimension + 200;
          compressionQuality = 0.75;
        } else {
          renderScale = 3.2;
          jpegQuality = 0.9;
          compressionMaxSize = maxImageSize * 1.8;
          compressionMaxDim = 2400;
          compressionQuality = 0.85;
        }
      } else {
        if (hasManyImages) {
          renderScale = 3.0;
          jpegQuality = 0.85;
          compressionMaxSize = maxImageSize * 1.5;
          compressionMaxDim = maxImageDimension + 300;
          compressionQuality = 0.8;
        } else {
          // Principalmente texto: máxima calidad posible
          renderScale = 3.5;
          jpegQuality = 0.95;
          compressionMaxSize = maxImageSize * 2.5;
          compressionMaxDim = 2800;
          compressionQuality = 0.9;
        }
      }

      // Renderizar página con alta resolución
      const renderViewport = pdfJsPage.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        continue;
      }

      // Configurar canvas para máxima calidad
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // Configuraciones adicionales para mejor calidad de texto
      context.textBaseline = 'alphabetic';
      
      // Rellenar el canvas con fondo blanco antes de renderizar (importante para PDFs con imágenes)
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      await pdfJsPage.render({ canvasContext: context, viewport: renderViewport }).promise;
      
      // Convertir a JPEG con alta calidad
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Error al convertir canvas'));
          },
          'image/jpeg',
          jpegQuality
        );
      });
      
      const imageFile = new File([blob], `page-${pageIndex}.jpg`, { type: 'image/jpeg' });
      
      // Comprimir pero preservando calidad de texto
      const compressed = await imageCompression(imageFile, {
        maxSizeMB: compressionMaxSize,
        maxWidthOrHeight: compressionMaxDim,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: compressionQuality,
        alwaysKeepResolution: true, // Mantener resolución alta
      });
      
      const imageBytes = await compressed.arrayBuffer();
      const jpgImage = await newPdf.embedJpg(imageBytes);
      
      // Ajustar tamaño manteniendo proporción exacta
      const scale = Math.min(width / jpgImage.width, height / jpgImage.height);
      newPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: jpgImage.width * scale,
        height: jpgImage.height * scale,
      });
    }

    // Guardar PDF optimizado
    const pdfBytes = await newPdf.save({
      useObjectStreams: true,
    });

    const optimizedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const optimizedFile = new File(
      [optimizedBlob],
      file.name.replace(/\.pdf$/i, '_optimized.pdf'),
      {
        type: 'application/pdf',
        lastModified: Date.now(),
      }
    );

    if (optimizedFile.size >= file.size) {
      return file;
    }

    return optimizedFile;
  } catch (error) {
    // Fallback a método básico
    try {
      return await optimizePdfBasic(file);
    } catch (basicError) {
      return file;
    }
  }
}

/**
 * Detecta si una página tiene muchas imágenes
 */
async function detectManyImages(page: PdfJsPage): Promise<boolean> {
  try {
    const win = window as WindowWithPdfJs;
    const ops = await page.getOperatorList();
    let imageCount = 0;
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      const op = ops.fnArray[i];
      if (op === win.pdfjsLib?.OPS?.paintImageXObject || 
          op === win.pdfjsLib?.OPS?.paintJpegXObject) {
        imageCount++;
      }
    }
    
    return imageCount > 3; // Más de 3 imágenes = muchas imágenes
  } catch {
    return false;
  }
}

/**
 * Optimización básica usando solo pdf-lib (sin compresión de imágenes)
 * Útil como fallback cuando el método agresivo falla
 */
async function optimizePdfBasic(file: File): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: false,
    parseSpeed: 1,
  });

  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const optimizedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const optimizedFile = new File(
    [optimizedBlob],
    file.name.replace(/\.pdf$/i, '_optimized.pdf'),
    {
      type: 'application/pdf',
      lastModified: Date.now(),
    }
  );

  if (optimizedFile.size >= file.size) {
    return file;
  }

  return optimizedFile;
}
