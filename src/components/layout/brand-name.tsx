"use client";

export function BrandName({ siteName, locale }: { siteName: string; locale: string }) {
  if (locale === "zh") {
    const zh = siteName.split(/\s+/)[0] || siteName;
    return <span className="text-gradient">{zh}</span>;
  }

  const parts = siteName.split(/\s+/);
  const english = parts.length > 1 ? parts.slice(1).join(" ") : siteName;
  const caiIndex = english.indexOf("Cai");
  if (caiIndex >= 0) {
    return (
      <>
        {english.slice(0, caiIndex)}
        <span className="text-gradient">{english.slice(caiIndex, caiIndex + 3)}</span>
        {english.slice(caiIndex + 3)}
      </>
    );
  }

  return <>{english}</>;
}
