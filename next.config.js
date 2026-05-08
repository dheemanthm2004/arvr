/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: Cross-Origin-Embedder-Policy is intentionally omitted.
  // Setting require-corp breaks MediaPipe CDN assets on mobile Safari/Android
  // because those CDN responses don't include CORP headers.
  // MediaPipe loads fine without COEP — it does not use SharedArrayBuffer.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@mediapipe/face_mesh",
        "@mediapipe/camera_utils",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
