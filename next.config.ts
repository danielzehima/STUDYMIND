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
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
