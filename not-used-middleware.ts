import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

// export default withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   function middleware(request: NextRequestWithAuth) {
//     // console.log(request);
//     // console.log(request.nextUrl.pathname);
//     // console.log(request.nextauth.token);

//     // If the user is authenticated, continue.
//     if (request.nextauth.token) return NextResponse.next();

//     // If the user is not authenticated, return a 403.
//     return redirect("/signin");
//     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//   },
//   {
//     callbacks: {
//       authorized: (p) => {
//         // console.log("authorized: ", p);
//         return !!p.token;
//       },
//     },
//     pages: {
//       signIn: "/signin",
//       error: "/error",
//       signOut: "/signout",
//       verifyRequest: "/verify",
//     },
//   }
// );

export { default } from "next-auth/middleware";

export const config = { matcher: [] };
