import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroIntent } from "../../lib/heroSubmission";

export function DestinationHero(props: {
  pending: boolean;
  error: string | null;
  onSubmit: (destination: string, intent: HeroIntent) => void;
}) {
  const [destination, setDestination] = useState("");

  return (
    <form
      className="flex w-full flex-col gap-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(destination, "shorten");
      }}
    >
      <label className="flex flex-col gap-2">
        <span className="sr-only">Destination</span>
        <Input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://"
          className="h-12 px-3 text-base md:text-base"
          aria-invalid={props.error !== null}
          required
        />
      </label>
      <Button type="submit" size="lg" className="h-11 w-full" disabled={props.pending}>
        {props.pending ? "Working…" : "Shorten"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full"
        disabled={props.pending}
        onClick={() => props.onSubmit(destination, "qr")}
      >
        {props.pending ? "Working…" : "QR code"}
      </Button>
      {props.error !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {props.error}
        </p>
      ) : null}
    </form>
  );
}
