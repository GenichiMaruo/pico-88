import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(45deg, #1e293b, #334155)",
          borderRadius: "36px",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 16 16" fill="#3b82f6">
          <path
            d="M 7 1 L 1 3 L 3 9 L 0 10 L 2 16 L 3 14 L 2 11 L 5 10 L 6 13 L 3 14 L 2 16 L 8 14 L 6 8 L 9 7 L 7 1 L 6 3 L 7 6 L 4 7 L 3 4 L 6 3 Z"
            transform="scale(0.9) translate(1,0)"
          />
        </svg>
      </div>
    ),
    size
  );
}
