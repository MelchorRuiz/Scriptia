import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/", "/profile", "/saved", "/likes", "/new-post"]);

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId, redirectToSignIn } = auth() 

    if (isProtectedRoute(context.request) && !userId) {
        return context.redirect('/sign-in');
    }
});
