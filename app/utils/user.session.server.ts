import type { Mentor, Profile } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { routes } from "~/routes";

const date = new Date();
const userSessionExpirationDate = new Date(date.setDate(date.getDate() + 30));

const sessionStorage = createCookieSessionStorage({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: "Hoots_user",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: userSessionExpirationDate, // 30 days
  },
});

async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return {
    getUser: () => {
      const user = session.get("user");
      return user || null;
    },
    setUser: (user: Partial<Profile>) => session.set("user", user),
    getMentorProfile: () => {
      const user = session.get("mentorProfile");
      return user || null;
    },
    setMentorProfile: (mentorProfile: Partial<Mentor>) =>
      session.set("mentorProfile", mentorProfile),
    commit: () => sessionStorage.commitSession(session),
    destroy: () => sessionStorage.destroySession(session),
  };
}

const { getSession, commitSession } = sessionStorage;

export { getUserSession, sessionStorage, getSession, commitSession };

export const getUser = async (request: Request) => {
  const userSession = await getUserSession(request);
  const user = userSession.getUser();
  return user || null;
};

export const getMentorProfile = async (request: Request) => {
  const userSession = await getUserSession(request);
  const mentorProfile = userSession.getMentorProfile();
  return mentorProfile || null;
};

export async function requireMentorProfile(request: Request): Promise<Mentor> {
  const mentorProfile: Mentor = await getMentorProfile(request);
  const session = await getUserSession(request);
  if (!mentorProfile) {
    throw redirect(
      `/login?returnTo=${encodeURIComponent(new URL(request.url).toString())}`,
      {
        headers: {
          "Set-Cookie": await session.destroy(),
        },
      }
    );
  }
  return mentorProfile;
}

export async function requireUser(request: Request): Promise<Profile> {
  const user: Profile = await getUser(request);
  const session = await getUserSession(request);
  if (!user) {
    throw redirect(
      `/login?returnTo=${encodeURIComponent(new URL(request.url).toString())}`,
      {
        headers: {
          "Set-Cookie": await session.destroy(),
        },
      }
    );
  }
  if (!user.verified) {
    throw redirect(routes.startCheckEmail);
  }
  return user;
}

export async function requireAdminUser(request: Request): Promise<Profile> {
  const user = await getUser(request);
  if (!user) {
    const session = await getUserSession(request);
    await session.destroy();
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await session.destroy(),
      },
    });
  }
  if (user.role !== "ADMIN") {
    throw redirect("/");
  }
  return user;
}
