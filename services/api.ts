import { supabase } from './supabase';
import { Transaction } from '../components/ui/TransactionItem';
import * as Linking from 'expo-linking';

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
}

export const CloudAPI = {
  // Auth
  login: async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  register: async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      // Format date nicely from timestamp
      date: new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: Number(item.amount),
      type: item.type,
      icon: item.icon as any,
    }));
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: session.user.id,
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          icon: transaction.icon,
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date).toLocaleDateString(),
      amount: Number(data.amount),
      type: data.type,
      icon: data.icon as any,
    } as Transaction;
  },

  updateTransaction: async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'date'>>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }

    return data;
  },

  setBudget: async (category_id: string, amount: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    // Using upsert based on user_id and category_id unique constraint
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: session.user.id,
        category_id,
        amount,
      }, { onConflict: 'user_id, category_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Password Recovery
  sendPasswordResetEmail: async (email: string) => {
    const redirectUrl = Linking.createURL('reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw new Error(error.message);
  },

  setSessionFromUrl: async (url: string) => {
    let hash = '';
    if (url.includes('#')) {
      hash = url.split('#')[1];
    } else if (url.includes('?')) {
      hash = url.split('?')[1];
    }
    if (!hash) {
      throw new Error('No se encontraron parámetros de recuperación en el enlace.');
    }

    const params: Record<string, string> = {};
    hash.split('&').forEach(part => {
      const [key, val] = part.split('=');
      if (key && val) {
        params[key] = decodeURIComponent(val);
      }
    });

    const access_token = params['access_token'];
    const refresh_token = params['refresh_token'];

    if (!access_token || !refresh_token) {
      throw new Error('Los tokens de acceso y actualización no están presentes en el enlace.');
    }

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    if (error) throw new Error(error.message);
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }
};
