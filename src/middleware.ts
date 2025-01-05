import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { env } from "./env";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE } from "./lib/constants";

const wixClient = createClient({
  auth: OAuthStrategy({ clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID }),
});

// * intercepts incoming HTTP reqs before they reach actual route handler
// * retrieve, generate visitor, validate, renew, handle renewal failure (...tokens), and set cookies
// * to get user's cart back
export async function middleware(request: NextRequest) {
  const cookies = request.cookies;
  const sessionCookie = cookies.get(WIX_SESSION_COOKIE);

  let sessionTokens = sessionCookie
    ? (JSON.parse(sessionCookie.value) as Tokens)
    : await wixClient.auth.generateVisitorTokens();

  if (sessionTokens.accessToken.expiresAt < Math.floor(Date.now() / 1000)) {
    try {
      sessionTokens = await wixClient.auth.renewToken(
        sessionTokens.refreshToken,
      );
    } catch (error) {
      sessionTokens = await wixClient.auth.generateVisitorTokens();
    }
  }

  // ? needed or not? GPT "req obj reps incoming req from client, modifying does not affect res sent back to client"
  // request.cookies.set(WIX_SESSION_COOKIE, JSON.stringify(sessionTokens));

  // * indicates req should proceed to next middleware or final route handler, passing {request} obj ensures any mods made to req obj are included in res
  const res = NextResponse.next({ request });

  res.cookies.set(WIX_SESSION_COOKIE, JSON.stringify(sessionTokens), {
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

// * negative lookahead regex, matches any path except the following
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
