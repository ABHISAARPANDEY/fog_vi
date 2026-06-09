"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT = [".mp4", ".mov", ".avi"];
const ACCEPT_MIME = "video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi";

function isAccepted(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPT.some((ext) => name.endsWith(ext)) || file.type.startsWith("video/");
}

interface DropzoneProps {
  onFile: (file: File) => void;
  uploading?: boolean;
  disabled?: boolean;
}

export function Dropzone({ onFile, uploading, disabled }: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError(null);
      const file = files?.[0];
      if (!file) return;
      if (!isAccepted(file)) {
        setError("Unsupported file. Please choose an .mp4, .mov or .avi video.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "glass flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-all",
          drag
            ? "border-accent bg-accent/5 shadow-glow"
            : "border-white/15 hover:border-white/30",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow transition-transform",
            drag && "scale-110"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <UploadCloud className="h-8 w-8 text-white" />
          )}
        </span>
        <h3 className="mt-6 text-lg font-semibold">
          {uploading ? "Uploading…" : "Drop foggy traffic footage here"}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          or <span className="text-accent">browse files</span> · MP4, MOV, AVI
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <FileVideo className="h-4 w-4" />
          Your video is processed by the FogVision backend
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MIME}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </motion.div>
      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
