import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Flower2, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { supabaseUser, appUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-sakura mb-4 animate-pulse">
                    <Flower2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!supabaseUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (appUser?.status === 'blocked') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="glass-strong rounded-3xl p-8 max-w-md text-center shadow-elevated">
                    <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🚫</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-foreground mb-2">Tài khoản bị khóa</h2>
                    <p className="text-sm text-muted-foreground">
                        Tài khoản của bạn đã bị quản trị viên khóa. Vui lòng liên hệ hỗ trợ.
                    </p>
                </div>
            </div>
        );
    }

    if (requireAdmin && appUser?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
