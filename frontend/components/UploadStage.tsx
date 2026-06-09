"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import {
  DetectionConfig,
  EnhancementSettings,
} from "@/components/EnhancementSettings";

interface Props {
  uploading: boolean;
  error: string | null;
  config: DetectionConfig;
  onFile: (file: File) => void;
  onConfigChange: (config: DetectionConfig) => void;
}

export function UploadStage({
  uploading,
  error,
  config,
  onFile,
  onConfigChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Dropzone onFile={onFile} uploading={uploading} disabled={uploading} />

      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <Zap className="h-4 w-4 text-accent" />
        Detection starts automatically the moment your video uploads.
      </div>

      {error && (
        <p className="text-center text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {/* Optional: tune enhancement & model before uploading. */}
      <EnhancementSettings config={config} onChange={onConfigChange} />
    </motion.div>
  );
}
