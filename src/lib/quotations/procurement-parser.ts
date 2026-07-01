export interface ParsedProductLine {
  rawText: string;
  quantity: number;
}

export interface ParsedProcurementRequest {
  productLines: ParsedProductLine[];
  destinationCity: string;
  incoterms: string;
  deliveryDays: number | null;
  extraNotes: string;
}

const PRODUCT_LINE_PATTERN =
  /([A-Za-z][A-Za-z0-9\s\-/.]+?)\s*[×xX*＊]\s*(\d+)/g;

const DESTINATION_PATTERN =
  /(?:送到|运至|发往|kirim\s+ke|deliver\s+to|ship\s+to|destination)\s*[：:]?\s*([A-Za-z][A-Za-z\s-]+)/i;

const INCOTERMS_PATTERN = /\b(CIF|FOB|EXW|DDP|CFR|CIP)\b/i;

const DELIVERY_PATTERN =
  /(?:within|dalam|)\s*(\d+)\s*(?:天|days?|hari)|(\d+)\s*天内(?:发货|发运|出货)?/i;

export function parseProcurementMessage(message: string): ParsedProcurementRequest {
  const productLines: ParsedProductLine[] = [];
  const matchedSpans: Array<[number, number]> = [];

  for (const match of message.matchAll(PRODUCT_LINE_PATTERN)) {
    const rawText = match[1]?.trim();
    const quantity = Number.parseInt(match[2] ?? "1", 10);
    if (!rawText || Number.isNaN(quantity) || quantity < 1) {
      continue;
    }
    productLines.push({ rawText, quantity });
    if (match.index !== undefined) {
      matchedSpans.push([match.index, match.index + match[0].length]);
    }
  }

  const destinationMatch = message.match(DESTINATION_PATTERN);
  const destinationCity = destinationMatch?.[1]?.trim() ?? "";

  const incotermsMatch = message.match(INCOTERMS_PATTERN);
  const incoterms = incotermsMatch?.[1]?.toUpperCase() ?? "";

  const deliveryMatch = message.match(DELIVERY_PATTERN);
  const deliveryDays = deliveryMatch
    ? Number.parseInt(deliveryMatch[1] ?? deliveryMatch[2] ?? "", 10)
    : null;

  let extraNotes = message;
  for (const [start, end] of matchedSpans.sort((a, b) => b[0] - a[0])) {
    extraNotes = extraNotes.slice(0, start) + extraNotes.slice(end);
  }
  extraNotes = extraNotes
    .replace(DESTINATION_PATTERN, "")
    .replace(INCOTERMS_PATTERN, "")
    .replace(DELIVERY_PATTERN, "")
    .replace(/我要买[：:]/gi, "")
    .replace(/^\s*[\n\r]+/gm, "")
    .trim();

  return {
    productLines,
    destinationCity,
    incoterms,
    deliveryDays: deliveryDays && !Number.isNaN(deliveryDays) ? deliveryDays : null,
    extraNotes,
  };
}
