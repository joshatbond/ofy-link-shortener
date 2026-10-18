import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OpenedLink } from "../../lib/pendingLink";
import { shortLinkLabel, shortLinkUrl } from "../../lib/shortLink";

export function CreatedLinkDialog(props: {
  opened: OpenedLink | null;
  onDismiss: () => void;
  onViewDetails: () => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const opened = props.opened;

  return (
    <Dialog
      open={opened !== null}
      onOpenChange={(open) => {
        if (!open) {
          props.onDismiss();
        }
      }}
    >
      {opened !== null ? (
        <CreatedLinkContent
          opened={opened}
          onViewDetails={props.onViewDetails}
          onCloseAutoFocus={props.onCloseAutoFocus}
        />
      ) : null}
    </Dialog>
  );
}

function CreatedLinkContent(props: {
  opened: OpenedLink;
  onViewDetails: () => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const label = shortLinkLabel(props.opened.slug);
  const url = shortLinkUrl(props.opened.slug);
  const linkRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <DialogContent
      className="sm:max-w-md"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        linkRef.current?.focus();
      }}
      onCloseAutoFocus={props.onCloseAutoFocus}
    >
      <DialogHeader className="pr-8">
        <DialogTitle className="text-xl">Here&apos;s your link!</DialogTitle>
        <DialogDescription>
          Share it across social media, newsletters, and more
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg bg-muted px-3 py-4 text-center">
        <p
          ref={linkRef}
          tabIndex={0}
          className="text-lg font-medium break-all text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {label}
        </p>
      </div>
      {props.opened.qr ? <ShortLinkQr value={url} label={label} /> : null}
      {copyError !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {copyError}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full sm:w-auto"
          onClick={props.onViewDetails}
        >
          View link details
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full sm:w-auto"
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </DialogContent>
  );

  async function copy() {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopyError("Could not copy the link.");
    }
  }
}

function ShortLinkQr(props: { value: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(props.value, {
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
    })
      .then((next) => {
        if (!cancelled) {
          setSrc(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [props.value]);

  if (src === null) {
    return null;
  }

  return (
    <img
      src={src}
      alt={`QR code for ${props.label}`}
      width={220}
      height={220}
      className="mx-auto rounded-md bg-white p-2"
    />
  );
}
