import { Tokens } from "@wix/sdk";
import Cookies from "js-cookie";
import { WIX_SESSION_COOKIE } from "./constants";
import { getWixClient } from "./wix-client.base";

const tokens: Tokens = JSON.parse(Cookies.get(WIX_SESSION_COOKIE) || "{}");

// * not func, can use single obj w/ all client comps bc browser NOT shared b/w diff users but backend server is
export const wixBrowserClient = getWixClient(tokens);
