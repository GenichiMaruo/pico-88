import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "20px",
              background: "linear-gradient(45deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <svg width="80" height="80" viewBox="0 0 16 16" fill="white">
              <path
                d="M 7 1 L 1 3 L 3 9 L 0 10 L 2 16 L 3 14 L 2 11 L 5 10 L 6 13 L 3 14 L 2 16 L 8 14 L 6 8 L 9 7 L 7 1 L 6 3 L 7 6 L 4 7 L 3 4 L 6 3 Z"
                transform="scale(0.9) translate(1,0)"
              />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 20px 0",
              fontFamily: "monospace",
              letterSpacing: "2px",
            }}
          >
            PICO-88
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "32px",
              color: "#cbd5e1",
              margin: "0 0 30px 0",
              fontWeight: "500",
            }}
          >
            8ビットCPUシミュレータ
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              margin: "0",
              maxWidth: "800px",
              lineHeight: "1.4",
            }}
          >
            教育・ホビー向けの仮想8ビットマイクロプロセッサ
            <br />
            ブラウザでアセンブリ言語を学ぼう
          </p>

          {/* Feature badges */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "40px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                border: "2px solid #3b82f6",
                borderRadius: "25px",
                padding: "8px 20px",
                color: "#93c5fd",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Webベース
            </div>
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                border: "2px solid #22c55e",
                borderRadius: "25px",
                padding: "8px 20px",
                color: "#86efac",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              教育向け
            </div>
            <div
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                border: "2px solid #a855f7",
                borderRadius: "25px",
                padding: "8px 20px",
                color: "#c4b5fd",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              レトロ
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
