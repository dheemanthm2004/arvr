/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MediaPipe WASM files to be served correctly
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  // Exclude MediaPipe from server-side bundling
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
