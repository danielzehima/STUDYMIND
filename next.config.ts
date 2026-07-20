import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Évite la mauvaise détection de la racine du workspace : un
  // package-lock.json existe dans C:\Users\HP (hors de ce projet).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // pdf-parse (via pdfjs-dist) charge son worker par un chemin de module
  // calculé au runtime ; le bundling Turbopack/Webpack casse cette
  // résolution ("Cannot find module .../pdf.worker.mjs"). On sort ces
  // packages du bundling pour qu'ils utilisent le require() natif de
  // Node.js, qui résout correctement depuis node_modules.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  // pdfjs-dist charge @napi-rs/canvas via un require() dynamique interne
  // que le traceur de fichiers de Next.js (@vercel/nft) ne détecte pas,
  // donc le binaire natif est exclu de la fonction serverless déployée
  // ("Cannot find module '@napi-rs/canvas'" en prod). On force son
  // inclusion pour la route qui fait l'extraction PDF.
  outputFileTracingIncludes: {
    "/api/documents": ["./node_modules/@napi-rs/canvas*/**/*"],
  },
};

export default nextConfig;
