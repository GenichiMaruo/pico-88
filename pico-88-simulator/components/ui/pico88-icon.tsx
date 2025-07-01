"use client";

interface Pico88IconProps {
  className?: string;
  enableDownload?: boolean;
}

export function Pico88Icon({
  className = "h-4 w-4",
  enableDownload = false,
}: Pico88IconProps) {
  const handleRightClick = (e: React.MouseEvent) => {
    if (!enableDownload) return;

    e.preventDefault();

    // SVGコンテンツを作成
    const svgContent = `<svg width="64" height="64" viewBox="0 0 16 16" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <path d="M 7 1 L 1 3 L 3 9 L 0 10 L 2 16 L 3 14 L 2 11 L 5 10 L 6 13 L 3 14 L 2 16 L 8 14 L 6 8 L 9 7 L 7 1 L 6 3 L 7 6 L 4 7 L 3 4 L 6 3 Z" transform="scale(0.9) translate(1,0)" fill="#000000"/>
</svg>`;

    // Blobを作成してダウンロード
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "pico88-icon.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // メモリリーク防止
    URL.revokeObjectURL(url);
  };

  return (
    <div title={enableDownload ? "右クリックでSVGをダウンロード" : undefined}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${
          enableDownload ? "cursor-context-menu" : ""
        }`}
        fill="currentColor"
        onContextMenu={handleRightClick}
      >
        <path
          d="M 7 1 L 1 3 L 3 9 L 0 10 L 2 16 L 3 14 L 2 11 L 5 10 L 6 13 L 3 14 L 2 16 L 8 14 L 6 8 L 9 7 L 7 1 L 6 3 L 7 6 L 4 7 L 3 4 L 6 3 Z"
          transform="scale(0.9) translate(1,0)"
        />
      </svg>
    </div>
  );
}
