import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "../components/page-frame";

export const Route = createFileRoute("/unknown")({
  component: UnknownPage,
});

function UnknownPage() {
  return (
    <PageFrame>
      <div className="mx-auto max-w-sm space-y-2">
        <h1 className="text-3xl">Unknown link</h1>
        <p className="text-neutral-400">
          The page you were looking for doesn't seem to exist!
        </p>
      </div>
    </PageFrame>
  );
}
