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
    return data || [];
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

// Log to Google Sheet via GAS Web App
async function logToSheet(bet: Omit<Bet, 'id' | 'timestamp'> & { user_name?: string }) {
    if (!GAS_URL) return;
    try {
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...bet,
                // Ensure field names match what GAS expects if needed, or just send everything
                userId: bet.user_name || bet.userId // Send Name if available, otherwise ID
            }),
        });
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
