import { ApiKeyStrategy, createClient, Tokens } from "@wix/sdk";
import { getWixClient } from "./wix-client.base";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE } from "./constants";
import { cache } from "react";
import { files } from "@wix/media";
import { env } from "@/env";

// * is func bc if used on single backend server process, will use same cookies for all requests on server but diff users have diff cookies
// * deduplicate reqs called by server comps within one page render, refreshing page recycles cache
export const getWixServerClient = cache(async () => {
  let tokens: Tokens | undefined;

  try {
    // * cookies are dynamic which causes dynamic caching rather than static
    // * DOCS "cookies, Dynamic API, returned vals cannot be known ahead of time, if used in layout or page will opt route into dynamic rendering"
    const cookieStore = await cookies();
    tokens = JSON.parse(cookieStore.get(WIX_SESSION_COOKIE)?.value || "{}");
  } catch (error) {}

  return getWixClient(tokens);
});

// TODO rewatch 5:50:00 important info
// TODO why perms for Wix API SDK file Manage Site Media skips moderation
// * Nextjs serverless funcs has limit of 4.5MB to backend, allows us to directly upload to Wix
export const getWixAdminClient = cache(() => {
  const wixClient = createClient({
    modules: {
      files,
    },
    auth: ApiKeyStrategy({
      apiKey: env.WIX_API_KEY,
      siteId: env.NEXT_PUBLIC_WIX_SITE_ID,
    }),
  });

  return wixClient;
});
