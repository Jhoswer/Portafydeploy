import { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export function ImageUploader({
  label,
  description,
  value,
  onChange,
  multiple = false,
  maxFiles = 4,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const images = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string" && value
    ? [value]
    : [];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
  const filesArray = Array.from(fileList).slice(
    0,
    multiple ? maxFiles - images.length : 1
  );

  const validFiles = filesArray.filter((file) => file.type.startsWith("image/"));

  if (validFiles.length === 0) return;

  if (multiple) {
    const newUrls = validFiles.map((file) => URL.createObjectURL(file));
    onChange([...images, ...newUrls].slice(0, maxFiles));
  } else {
    const file = validFiles[0];
    const url  = URL.createObjectURL(file);
    onChange(file, url);
  }
};

  const removeImage = (indexToRemove) => {
    if (multiple) {
      const newImages = [...images];
      newImages.splice(indexToRemove, 1);
      onChange(newImages);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {!multiple && images.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden border group w-full h-48 bg-muted">
          <img
            src={images[0]}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeImage(0)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {(!multiple || images.length < maxFiles) && (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>

              <p className="text-sm font-medium mb-1">
                Haz clic para subir o arrastra y suelta
              </p>

              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF hasta 5MB
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                multiple={multiple}
                className="hidden"
              />
            </div>
          )}

          {multiple && images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden border group aspect-square bg-muted"
                >
                  <img
                    src={url}
                    alt={`Upload ${i}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}