"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
  }, []);

  return {
    user,
    isAdmin,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signInWithEmail: (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password),
    signOut: () => signOut(auth),
  };
}
