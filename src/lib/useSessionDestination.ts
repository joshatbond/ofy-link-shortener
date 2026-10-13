import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useAuthCodeExchangeFailed } from "./authCodeExchange";
import {
  authCodeStillUnread,
  sessionRoute,
  shouldSubscribeViewer,
  type SessionRoute,
} from "./sessionRoute";

/**
 * Dashboard vs marketing, from a settled `users.viewer` only.
 *
 * The subscription stays skipped through the render that clears
 * `isLoading`. `setAuth` runs in that commit's passive effect, before this
 * hook's effect arms the query, so the first result is not an
 * unauthenticated null.
 */
export function useSessionDestination(): SessionRoute {
  const { isLoading } = useConvexAuth();
  const handshakeFailed = useAuthCodeExchangeFailed();
  const codeUnread = authCodeStillUnread(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const handshakeSettled = !isLoading || handshakeFailed;
  const subscriptionArmed = useSubscriptionArmed(
    handshakeSettled && !codeUnread,
  );
  const viewerId = useQuery(
    api.features.users.viewer,
    shouldSubscribeViewer({
      codeUnread,
      handshakeSettled,
      subscriptionArmed,
    })
      ? {}
      : "skip",
  );

  return sessionRoute({ codeUnread, viewerId });
}

function useSubscriptionArmed(ready: boolean): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (ready) {
      setArmed(true);
    }
  }, [ready]);
  return armed;
}
