import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface AppUser {
    user_id: number;
    auth_uid: string;
    email: string;
    role: 'USER' | 'ADMIN';
    status: 'active' | 'blocked';
    created_at: string;
    updated_at: string;
}

export interface AppProfile {
    profile_id: number;
    user_id: number;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    updated_at: string;
}

export interface AppWallet {
    wallet_id: number;
    user_id: number;
    form_balance: number;
    total_forms_added: number;
    total_forms_used: number;
    last_updated: string;
}

interface AuthContextType {
    supabaseUser: SupabaseUser | null;
    session: Session | null;
    appUser: AppUser | null;
    profile: AppProfile | null;
    wallet: AppWallet | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [profile, setProfile] = useState<AppProfile | null>(null);
    const [wallet, setWallet] = useState<AppWallet | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (authUid: string) => {
        try {
            // Fetch user record
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('auth_uid', authUid)
                .single();

            if (userError || !userData) {
                console.error('Error fetching user:', userError);
                return;
            }
            setAppUser(userData as AppUser);

            // Fetch profile
            const { data: profileData } = await supabase
                .from('user_profile')
                .select('*')
                .eq('user_id', userData.user_id)
                .single();
            setProfile(profileData as AppProfile | null);

            // Fetch wallet
            const { data: walletData } = await supabase
                .from('user_wallet')
                .select('*')
                .eq('user_id', userData.user_id)
                .single();
            setWallet(walletData as AppWallet | null);
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const refreshUserData = async () => {
        if (supabaseUser) {
            await fetchUserData(supabaseUser.id);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setSupabaseUser(session?.user ?? null);
            if (session?.user) {
                fetchUserData(session.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setSupabaseUser(session?.user ?? null);
                if (session?.user) {
                    // Use setTimeout to avoid potential deadlock with Supabase realtime
                    setTimeout(() => {
                        fetchUserData(session.user.id).finally(() => setLoading(false));
                    }, 100);
                } else {
                    setAppUser(null);
                    setProfile(null);
                    setWallet(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        if (error) return { error: error.message };
        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setAppUser(null);
        setProfile(null);
        setWallet(null);
    };

    const isAdmin = appUser?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                supabaseUser,
                session,
                appUser,
                profile,
                wallet,
                loading,
                signUp,
                signIn,
                signOut,
                refreshUserData,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
