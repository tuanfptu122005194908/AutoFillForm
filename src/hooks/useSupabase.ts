import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ─── Wallet ───
export function useWallet() {
    const { appUser } = useAuth();
    return useQuery({
        queryKey: ['wallet', appUser?.user_id],
        queryFn: async () => {
            if (!appUser) return null;
            const { data, error } = await supabase
                .from('user_wallet')
                .select('*')
                .eq('user_id', appUser.user_id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!appUser,
    });
}

// ─── Transactions ───
export function useTransactions() {
    const { appUser } = useAuth();
    return useQuery({
        queryKey: ['transactions', appUser?.user_id],
        queryFn: async () => {
            if (!appUser) return [];
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', appUser.user_id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
        enabled: !!appUser,
    });
}

// ─── Orders (user's own) ───
export function useOrders() {
    const { appUser } = useAuth();
    return useQuery({
        queryKey: ['orders', appUser?.user_id],
        queryFn: async () => {
            if (!appUser) return [];
            const { data, error } = await supabase
                .from('orders')
                .select('*, payments(*)')
                .eq('user_id', appUser.user_id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
        enabled: !!appUser,
    });
}

// ─── Create Order (TopUp) ───
export function useCreateOrder() {
    const queryClient = useQueryClient();
    const { appUser } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            formCount,
            amountVnd,
            transferContent,
        }: {
            formCount: number;
            amountVnd: number;
            transferContent: string;
        }) => {
            if (!appUser) throw new Error('Not authenticated');

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: appUser.user_id,
                    amount_vnd: amountVnd,
                    forms_to_add: formCount,
                    transfer_content: transferContent,
                    status: 'pending',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    order_id: order.order_id,
                    bank_account_no: '0123456789',
                    bank_account_name: 'TUAN VA QUAN',
                    bank_name: 'MB Bank (MBBank)',
                    amount_vnd: amountVnd,
                    transfer_content: transferContent,
                    method: 'manual',
                    status: 'pending',
                });

            if (paymentError) throw paymentError;
            return order;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({ title: '✅ Đã tạo đơn nạp!', description: 'Vui lòng chờ admin xác nhận.' });
        },
        onError: (err: any) => {
            toast({ title: '❌ Lỗi', description: err.message, variant: 'destructive' });
        },
    });
}

// ─── Form History ───
export function useFormHistory() {
    const { appUser } = useAuth();
    return useQuery({
        queryKey: ['form_history', appUser?.user_id],
        queryFn: async () => {
            if (!appUser) return [];
            const { data, error } = await supabase
                .from('form_history')
                .select('*')
                .eq('user_id', appUser.user_id)
                .order('ran_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
        enabled: !!appUser,
    });
}

// ─── Use Form Credit (debit 1 form) ───
export function useFormCredit() {
    const queryClient = useQueryClient();
    const { appUser } = useAuth();

    return useMutation({
        mutationFn: async ({
            toolName,
            formUrl,
            ipAddress,
        }: {
            toolName?: string;
            formUrl?: string;
            ipAddress?: string;
        }) => {
            if (!appUser) throw new Error('Not authenticated');
            const { data, error } = await supabase.rpc('use_form_credit', {
                p_user_id: appUser.user_id,
                p_tool_name: toolName ?? 'Auto Fill',
                p_form_url: formUrl,
                p_ip_address: ipAddress,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['form_history'] });
        },
    });
}

// ─────────────────────────────────────────────
// ADMIN HOOKS
// ─────────────────────────────────────────────

// ─── Admin: All Orders ───
export function useAdminOrders() {
    const { isAdmin } = useAuth();
    return useQuery({
        queryKey: ['admin_orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, users!inner(email, user_id), payments(*)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
        enabled: isAdmin,
    });
}

// ─── Admin: Approve / Reject Order ───
export function useAdminOrderAction() {
    const queryClient = useQueryClient();
    const { appUser } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            orderId,
            action,
        }: {
            orderId: number;
            action: 'approve' | 'reject';
        }) => {
            if (!appUser) throw new Error('Not authenticated');

            if (action === 'approve') {
                const { error } = await supabase.rpc('approve_order', {
                    p_order_id: orderId,
                    p_admin_user_id: appUser.user_id,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'rejected', updated_at: new Date().toISOString() })
                    .eq('order_id', orderId);
                if (error) throw error;
            }
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
            toast({
                title: vars.action === 'approve' ? '✅ Đã duyệt đơn' : '❌ Đã từ chối đơn',
            });
        },
        onError: (err: any) => {
            toast({ title: '❌ Lỗi', description: err.message, variant: 'destructive' });
        },
    });
}

// ─── Admin: All Users ───
export function useAdminUsers() {
    const { isAdmin } = useAuth();
    return useQuery({
        queryKey: ['admin_users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*, user_profile(*), user_wallet(*)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data ?? [];
        },
        enabled: isAdmin,
    });
}

// ─── Admin: Toggle User Status ───
export function useAdminToggleUserStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            userId,
            newStatus,
        }: {
            userId: number;
            newStatus: 'active' | 'blocked';
        }) => {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('user_id', userId);
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['admin_users'] });
            toast({
                title: vars.newStatus === 'blocked' ? '🔒 Đã khóa user' : '🔓 Đã mở khóa user',
            });
        },
        onError: (err: any) => {
            toast({ title: '❌ Lỗi', description: err.message, variant: 'destructive' });
        },
    });
}

// ─── Admin: Dashboard Stats ───
export function useAdminStats() {
    const { isAdmin } = useAuth();
    return useQuery({
        queryKey: ['admin_stats'],
        queryFn: async () => {
            const [usersRes, pendingRes, totalRevenueRes, totalFormsRes] = await Promise.all([
                supabase.from('users').select('user_id', { count: 'exact', head: true }),
                supabase.from('orders').select('order_id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('orders').select('amount_vnd').eq('status', 'approved'),
                supabase.from('user_wallet').select('total_forms_added'),
            ]);

            const totalRevenue = (totalRevenueRes.data ?? []).reduce(
                (sum: number, o: any) => sum + Number(o.amount_vnd), 0
            );
            const totalForms = (totalFormsRes.data ?? []).reduce(
                (sum: number, w: any) => sum + Number(w.total_forms_added), 0
            );

            return {
                totalUsers: usersRes.count ?? 0,
                pendingOrders: pendingRes.count ?? 0,
                totalRevenue,
                totalForms,
            };
        },
        enabled: isAdmin,
    });
}
