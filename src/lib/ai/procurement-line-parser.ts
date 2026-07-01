export interface ParsedProcurementLine {
  rawText: string;
  brand?: string;
  model?: string;
  quantity: number;
  unit: string;
  productText: string;
}

const QTY_UNIT_PATTERN =
  /\s+(\d+)\s*(pcs|pc|units?|ea|sets?|个|件|buah|unit)?\s*$/i;

const TIMES_QTY_PATTERN = /[×xX*＊]\s*(\d+)\s*$/;

const HEADER_PATTERN =
  /^(product|item|description|brand|model|qty|quantity|unit|no\.?|#|产品|型号|数量|单位)$/i;

function splitBrandModel(text: string): { brand?: string; model?: string } {
  const parts = text.trim().split(/\s+/);
  if (parts.length <= 1) return { model: text.trim() };
  return { brand: parts[0], model: parts.slice(1).join(" ") };
}

function parseSingleLine(line: string): ParsedProcurementLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) return null;
  if (HEADER_PATTERN.test(trimmed)) return null;

  let quantity = 1;
  let unit = "pcs";
  let productText = trimmed;

  const timesMatch = trimmed.match(TIMES_QTY_PATTERN);
  if (timesMatch) {
    quantity = Number.parseInt(timesMatch[1], 10) || 1;
    productText = trimmed.replace(TIMES_QTY_PATTERN, "").trim();
  } else {
    const qtyMatch = trimmed.match(QTY_UNIT_PATTERN);
    if (qtyMatch) {
      quantity = Number.parseInt(qtyMatch[1], 10) || 1;
      unit = qtyMatch[2]?.toLowerCase() || "pcs";
      productText = trimmed.replace(QTY_UNIT_PATTERN, "").trim();
    }
  }

  if (!productText) return null;

  const tabParts = productText.split(/\t+/).map((p) => p.trim()).filter(Boolean);
  if (tabParts.length >= 2) {
    const last = tabParts[tabParts.length - 1];
    const num = Number.parseInt(last, 10);
    if (!Number.isNaN(num) && num > 0 && tabParts.length >= 2) {
      quantity = num;
      productText = tabParts.slice(0, -1).join(" ");
    } else if (tabParts.length >= 3) {
      const qtyCol = Number.parseInt(tabParts[tabParts.length - 2], 10);
      if (!Number.isNaN(qtyCol) && qtyCol > 0) {
        quantity = qtyCol;
        unit = tabParts[tabParts.length - 1] || "pcs";
        productText = tabParts.slice(0, -2).join(" ");
      }
    }
  }

  const commaParts = productText.split(",").map((p) => p.trim());
  if (commaParts.length === 2) {
    const num = Number.parseInt(commaParts[1], 10);
    if (!Number.isNaN(num) && num > 0) {
      productText = commaParts[0];
      quantity = num;
    }
  }

  const { brand, model } = splitBrandModel(productText);

  return {
    rawText: trimmed,
    brand,
    model,
    quantity,
    unit,
    productText,
  };
}

export function parseProcurementLines(text: string): ParsedProcurementLine[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ParsedProcurementLine[] = [];
  for (const line of lines) {
    const parsed = parseSingleLine(line);
    if (parsed) results.push(parsed);
  }
  return results;
}

export function parseProcurementLinesFromRows(rows: string[][]): ParsedProcurementLine[] {
  const results: ParsedProcurementLine[] = [];
  for (const row of rows) {
    const cells = row.map((c) => String(c ?? "").trim()).filter(Boolean);
    if (cells.length === 0) continue;
    if (cells.length === 1) {
      const parsed = parseSingleLine(cells[0]);
      if (parsed) results.push(parsed);
      continue;
    }
    const joined = cells.join("\t");
    const parsed = parseSingleLine(joined);
    if (parsed) results.push(parsed);
  }
  return results;
}
