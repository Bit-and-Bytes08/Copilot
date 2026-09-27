"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpIcon, SquareIcon, PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Composer({
  onSend,
  onStop,
  streaming,
  disabled,
  placeholder = `Message ${APP_CONFIG.appName}…`,
  autoFocus,
}: {
  onSend: (text: string, attachment?: File) => void;
  onStop: () => void;
  streaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(min-width: 768px)").matches) ref.current?.focus();
  }, [autoFocus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }

    setAttachment(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Reset input so the same file can be selected again if removed
    e.target.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (streaming) return onStop();
    if ((!value.trim() && !attachment) || disabled) return;
    onSend(value, attachment);
    setValue("");
    setAttachment(null);
    setPreviewUrl(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const touch = window.matchMedia("(hover: none)").matches;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !touch) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = streaming || ((!!value.trim() || !!attachment) && !disabled);

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl rounded-3xl border bg-card p-2.5 pl-4 shadow-sm transition-colors focus-within:border-ring"
    >
      {previewUrl && (
        <div className="mb-2 flex items-start gap-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
            <img
              src={previewUrl}
              alt="Attachment preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
              aria-label="Remove attachment"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        </div>
      )}
      <label htmlFor="composer" className="sr-only">
        Message
      </label>
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          aria-label="Attach image"
        >
          <PlusIcon className="size-5" />
        </button>
        <textarea
          id="composer"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          enterKeyHint="send"
          className="field-sizing-content max-h-52 min-h-7 w-full resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      <div className="mt-1 flex items-center justify-end">
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={streaming ? "Stop generating" : "Send message"}
          className={cn("rounded-full", !canSend && "opacity-30")}
        >
          {streaming ? <SquareIcon className="size-3.5 fill-current" /> : <ArrowUpIcon />}
        </Button>
      </div>
    </form>
  );
}
