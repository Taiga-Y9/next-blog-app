import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setToken(session?.access_token || null);
      } catch (error) {
        console.error("セッション取得失敗", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setToken(session?.access_token || null);
      },
    );
    return () => authListener?.subscription?.unsubscribe();
  }, []);

  return { isLoading, session, token };
};
