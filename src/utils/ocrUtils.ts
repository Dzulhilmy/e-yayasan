import Tesseract from "tesseract.js";

/* ──────────────────────────── keyword map ──────────────────────────── */

const DOC_KEYWORDS: Record<string, string[]> = {
  "IC / MyKad": [
    "mykad",
    "kad pengenalan",
    "identity card",
    "warganegara",
    "jabatan pendaftaran negara",
    "jpn",
    "permanent resident",
    "pemastautin tetap",
    "no. kad pengenalan",
    "nama",
    "alamat",
    "religion",
    "agama",
  ],
  "Sijil Lahir": [
    "sijil kelahiran",
    "birth certificate",
    "sijil lahir",
    "pendaftaran kelahiran",
    "tempat lahir",
    "place of birth",
    "tarikh lahir",
    "date of birth",
    "jabatan pendaftaran negara",
    "bapa",
    "ibu",
    "father",
    "mother",
  ],
  "Keputusan SPM/STPM": [
    "sijil pelajaran malaysia",
    "spm",
    "stpm",
    "keputusan peperiksaan",
    "lembaga peperiksaan",
    "examination result",
    "gred",
    "mata pelajaran",
    "bahasa melayu",
    "bahasa inggeris",
    "matematik",
    "sejarah",
    "pendidikan islam",
    "slip keputusan",
  ],
  "Transkrip Universiti": [
    "transkrip",
    "transcript",
    "semester",
    "kredit",
    "cgpa",
    "gpa",
    "universiti",
    "university",
    "fakulti",
    "faculty",
    "ijazah",
    "degree",
    "diploma",
    "sarjana",
    "akademik",
    "academic",
    "jabatan",
    "department",
  ],
  "Slip Gaji": [
    "slip gaji",
    "payslip",
    "salary",
    "gaji pokok",
    "gaji bersih",
    "gaji kasar",
    "kwsp",
    "epf",
    "socso",
    "perkeso",
    "caruman",
    "elaun",
    "potongan",
    "allowance",
    "deduction",
    "net pay",
    "gross pay",
    "basic salary",
  ],
  "Surat Tawaran IPT": [
    "surat tawaran",
    "offer letter",
    "kemasukan",
    "pengajian",
    "institut pengajian tinggi",
    "tawaran tempat",
    "letter of offer",
    "admission",
    "enrollment",
    "program pengajian",
    "yuran",
    "pendaftaran kursus",
    "matrikulasi",
  ],
};

/* ──────────────────────────── OCR extraction ──────────────────────────── */

/**
 * Extract text from an image or PDF file using Tesseract.js OCR.
 * For images: directly OCR the file.
 * For PDFs: renders the first page to a canvas, then OCR that image.
 * Returns the extracted text string.
 */
export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  let imageSource: string | HTMLCanvasElement;

  if (isPdf) {
    // Render first page of PDF to canvas
    imageSource = await renderPdfFirstPage(file);
  } else {
    // For images, create an object URL directly
    imageSource = URL.createObjectURL(file);
  }

  try {
    const result = await Tesseract.recognize(imageSource, "eng+msa", {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.(Math.round(m.progress * 100));
        }
      },
    });
    return result.data.text;
  } finally {
    // Cleanup object URL if we created one
    if (typeof imageSource === "string" && imageSource.startsWith("blob:")) {
      URL.revokeObjectURL(imageSource);
    }
  }
}

/**
 * Renders the first page of a PDF file to an HTMLCanvasElement.
 * Uses pdf.js loaded from CDN to avoid heavy bundled dependency.
 */
async function renderPdfFirstPage(file: File): Promise<HTMLCanvasElement> {
  // Dynamically load pdfjs from CDN
  const pdfjsVersion = "4.9.155";
  const cdnBase = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}`;

  // Load the library if not already loaded
  if (!(window as any).pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${cdnBase}/pdf.min.mjs`;
      script.type = "module";
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Fallback: try loading as classic script if module didn't work
    if (!(window as any).pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${cdnBase}/pdf.min.js`;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("Failed to load pdf.js library");
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = `${cdnBase}/pdf.worker.min.mjs`;

  const arrayBuf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
  const page = await doc.getPage(1);

  const scale = 2; // Higher scale = better OCR accuracy
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas;
}

/* ──────────────────────────── doc type detection ──────────────────────── */

/**
 * Detect document type by matching OCR text against keyword database.
 * Returns the best-matching document type, or "Lain-lain" if no match.
 */
export function detectDocType(text: string): { type: string; confidence: number } {
  const normalised = text.toLowerCase();

  let bestType = "Lain-lain";
  let bestScore = 0;

  for (const [docType, keywords] of Object.entries(DOC_KEYWORDS)) {
    let matchCount = 0;
    for (const kw of keywords) {
      if (normalised.includes(kw)) {
        matchCount++;
      }
    }

    // Calculate confidence as percentage of matched keywords
    const score = matchCount / keywords.length;

    if (matchCount >= 2 && score > bestScore) {
      bestScore = score;
      bestType = docType;
    }
  }

  return {
    type: bestType,
    confidence: Math.round(bestScore * 100),
  };
}

/**
 * Combined helper: extract text + detect type.
 */
export async function scanAndDetect(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  text: string;
  detectedType: string;
  confidence: number;
}> {
  const text = await extractTextFromFile(file, onProgress);
  const { type, confidence } = detectDocType(text);
  return { text, detectedType: type, confidence };
}
