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
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
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
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
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
          email: u.email,
          full_name: (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? null,
          avatar_url: (u.user_metadata?.avatar_url as string) ?? null,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .then(() => undefined);
  }, [session?.user]);

  const value: AuthValue = {
    user: session?.user ?? null,
    session,
    loading,
    isAdmin: (roles ?? []).includes("admin"),
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
