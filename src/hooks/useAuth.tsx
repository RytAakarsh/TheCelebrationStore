import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if the current URL has OAuth or email confirmation tokens that Supabase needs to process
    const hasPendingTokens =
      typeof window !== "undefined" &&
      (window.location.hash.includes("access_token") ||
        window.location.search.includes("code=") ||
        window.location.hash.includes("error="));

    let timer: ReturnType<typeof setTimeout> | null = null;
    if (hasPendingTokens) {
      // Allow up to 3.5s for Supabase to exchange hash or code before forcing loading state resolution
      timer = setTimeout(() => {
        setLoading(false);
      }, 3500);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (timer) clearTimeout(timer);
      setSession(next);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: ["me"] });
        if (event !== "SIGNED_OUT") {
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        }
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      // If there are pending URL tokens and session is not yet established, do NOT prematurely mark loading as false!
      // Wait for onAuthStateChange to complete the exchange.
      if (data.session) {
        if (timer) clearTimeout(timer);
        setSession(data.session);
        setLoading(false);
      } else if (!hasPendingTokens) {
        setSession(null);
        setLoading(false);
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const userId = session?.user.id;

  const { data: roles } = useQuery({
    queryKey: ["me", "roles", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => r.role as string);
    },
  });

  // keep profile fresh (last login + basic details from the provider)
  useEffect(() => {
    if (!session?.user) return;
    const u = session.user;
    supabase
      .from("profiles")
      .upsert(
        {
          id: u.id,
          email: u.email ?? null,
          full_name:
            (u.user_metadata?.["full_name"] as string) ?? (u.user_metadata?.["name"] as string) ?? null,
          avatar_url: (u.user_metadata?.["avatar_url"] as string) ?? null,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .then(() => {
        // If this is the store admin email, ensure admin role is claimed if available
        if (u.email?.toLowerCase() === "thecelebrationstore@gmail.com") {
          Promise.resolve((supabase.rpc as any)("claim_first_admin")).then(() => {
            queryClient.invalidateQueries({ queryKey: ["me", "roles", u.id] });
          }).catch(() => undefined);
        }
      });
  }, [session?.user, queryClient]);

  const isStoreAdminEmail = session?.user?.email?.toLowerCase() === "thecelebrationstore@gmail.com";

  const value: AuthValue = {
    user: session?.user ?? null,
    session,
    loading,
    isAdmin: (roles ?? []).includes("admin") || isStoreAdminEmail,
    signOut: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
