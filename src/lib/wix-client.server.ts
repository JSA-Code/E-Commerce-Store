import { Tokens } from "@wix/sdk";
import { getWixClient } from "./wix-client.base";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE } from "./constants";
import { cache } from "react";

// * did not do "export const" bc if used on single backend server process, will use same cookies for all requests on server but diff users have diff cookies
export const getWixServerClient = cache(async () => {
  let tokens: Tokens | undefined;

  try {
    // * cookies are dynamic which causes dynamic caching rather than static
    const cookieStore = await cookies();
    tokens = JSON.parse(cookieStore.get(WIX_SESSION_COOKIE)?.value || "{}");
  } catch (error) {}

  return getWixClient(tokens);
});
