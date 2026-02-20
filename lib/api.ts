import { supabase } from './supabase';
import { Bet, User } from './types';
import { MOCK_USERS, MOCK_BETS } from './mock';

// Allow fallback to mock if no ENV
const useMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;
const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

export async function fetchUsers(): Promise<User[]> {
    if (useMock) return MOCK_USERS;

    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);

    // PATCH: Fix Typos in Data from DB (富田 -> 冨田) to ensure sort works
    const patchedData = (data || []).map((u: User) => {
        if (u.jockey === "富田") return { ...u, jockey: "冨田" };
        return u;
    });

    return patchedData;
}

export async function updateUserPin(userId: string, newPin: string) {
    if (useMock) return { error: null };
    const { error } = await supabase.from('users').update({ pin: newPin }).eq('id', userId);
    return { error };
}

export async function updateUserName(userId: string, newName: string) {
    if (useMock) return { error: null };
    const { error } = await supabase.from('users').update({ name: newName }).eq('id', userId);
    return { error };
}

export async function fetchBets(): Promise<Bet[]> {
    if (useMock) return MOCK_BETS;

    const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) console.error('Error fetching bets:', error);

    return (data || []).map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        raceId: b.race_id,
        investment: b.investment,
        returnAmount: b.return_amount,
        timestamp: b.created_at
    }));
}

export async function fetchUserBets(userId: string): Promise<Bet[]> {
    if (useMock) return MOCK_BETS.filter(b => b.userId === userId);

    const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user bets:', error);
        return [];
    }

    return (data || []).map((b: any) => ({
        id: b.id,
        userId: b.user_id,
        raceId: b.race_id,
        investment: b.investment,
        returnAmount: b.return_amount,
        timestamp: b.created_at
    }));
}

// Log to Google Sheet via GAS Web App
async function logToSheet(bet: Omit<Bet, 'id' | 'timestamp'> & { user_name?: string }) {
    if (!GAS_URL) {
        console.warn("GAS_URL is not defined");
        return;
    }
    try {
        console.log("Sending to GAS...", bet);
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain", // Important for GAS no-cors
            },
            body: JSON.stringify({
                ...bet,
                // Ensure field names match what GAS expects if needed, or just send everything
                userId: bet.user_name || bet.userId // Send Name if available, otherwise ID
            }),
        });
        console.log("Request sent to GAS (no-cors opaque response)");
    } catch (e) {
        console.error("Failed to log to sheet", e);
    }
}

export async function createBet(bet: Omit<Bet, 'id' | 'timestamp'> & { user_name?: string }) {
    // 1. Supabase / Mock
    if (useMock) {
        console.log("Mock Bet Created", bet);
        return { error: null };
    }

    const { error } = await supabase.from('bets').insert({
        user_id: bet.userId,
        race_id: bet.raceId,
        investment: bet.investment,
        return_amount: bet.returnAmount
    });

    if (!error) {
        // 2. Log to Sheet (Fire & Forget)
        logToSheet(bet);
    }

    return { error };
}

export async function resetBets() {
    if (useMock) {
        console.log("Mock Bets Reset");
        return { error: null };
    }

    // Delete all rows in 'bets' table
    const { error: deleteError } = await supabase
        .from('bets')
        .delete()
        .gt('investment', -1); // Assuming investment is >= 0

    return { error: deleteError };
}

// System Status API
export async function fetchSystemStatus() {
    if (useMock) return { isBettingClosed: false };

    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error("Error fetching system status:", error);
        return { isBettingClosed: false }; // Default
    }

    return { isBettingClosed: data.is_betting_closed };
}

export async function updateSystemStatus(isClosed: boolean) {
    if (useMock) {
        console.log("Mock System Status Updated:", isClosed);
        return { error: null };
    }

    const { error } = await supabase
        .from('system_settings')
        .update({ is_betting_closed: isClosed, updated_at: new Date().toISOString() })
        .eq('id', 1);

    return { error };
}
