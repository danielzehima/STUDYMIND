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
  // pdfkit résout ses fichiers de police via __dirname au moment du build ;
  // Turbopack a essayé de bundler pdfkit et a réécrit ce chemin en
  // "/ROOT/node_modules/pdfkit/js/data/..." (placeholder jamais résolu en
  // prod, "ENOENT" au runtime). Même classe de bug que pdf-parse/
  // pdfjs-dist ci-dessous : on le sort du bundling.
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "pdfkit",
  ],
  // pdfjs-dist charge @napi-rs/canvas et son propre worker
  // (pdf.worker.mjs) via des chemins calculés au runtime que le traceur
  // de fichiers de Next.js (@vercel/nft) ne détecte pas : ils finissent
  // exclus de la fonction serverless déployée ("Cannot find module
  // '@napi-rs/canvas'", puis "Cannot find module '.../pdf.worker.mjs'"
  // en prod). On force l'inclusion des deux packages en entier pour la
  // route qui fait l'extraction PDF.
  outputFileTracingIncludes: {
    "/api/documents": [
      "./node_modules/@napi-rs/canvas*/**/*",
      "./node_modules/pdfjs-dist/**/*",
    ],
  },
};

export default nextConfig;
