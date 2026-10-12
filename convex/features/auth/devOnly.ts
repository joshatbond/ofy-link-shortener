import { env } from "../../_generated/server";

/** True on local Convex dev (`SITE_URL` localhost) or when explicitly opted in. */
export function isLocalDevDeployment(): boolean {
  if (env.DEV_PASSWORD_AUTH === "true") {
    return true;
  }

  if (env.INVITE_DEV_RELAXED === "true") {
    return true;
  }

  return isLocalDevSiteUrl(env.SITE_URL);
}

function isLocalDevSiteUrl(siteUrl: string | undefined): boolean {
  if (siteUrl === undefined || siteUrl === "") {
    return false;
  }

  try {
    const hostname = new URL(
      siteUrl.includes("://") ? siteUrl : `https://${siteUrl}`,
    ).hostname;

    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
