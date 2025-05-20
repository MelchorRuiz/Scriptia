import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher([
    "/", 
    "/explore",
    "/profile", 
    "/saved", 
    "/likes", 
    "/new-post",
    "/post/:postId",
    "/user/:username",
]);

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId } = auth() 

    if (isProtectedRoute(context.request) && !userId) {
        return context.redirect('/sign-in');
    }
});
