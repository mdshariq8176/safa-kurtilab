import { createClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fully functional client-side Mock Supabase Auth engine for local sandbox testing
class MockSupabaseAuth {
  private listeners: Array<(event: string, session: Session | null) => void> = [];
  private currentSession: Session | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safa-kurtilab-mock-session');
      if (saved) {
        try {
          this.currentSession = JSON.parse(saved) as Session;
        } catch {
          this.currentSession = null;
        }
      }
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', this.currentSession));
  }

  async signInWithOtp({ email, phone }: { email?: string; phone?: string }) {
    console.log(`[Mock Supabase Auth] Requested OTP for: ${email || phone}`);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 100));
    return { data: { message: 'OTP code sent' }, error: null };
  }

  async verifyOtp(params: {
    email?: string;
    phone?: string;
    token: string;
    type: 'email' | 'sms';
  }) {
    const { email, phone, token } = params;
    console.log(`[Mock Supabase Auth] Verifying OTP: ${token} for: ${email || phone}`);
    await new Promise((r) => setTimeout(r, 100));

    if (token !== '123456' && token.length !== 6) {
      return { data: { session: null }, error: new Error('Invalid 6-digit OTP code.') };
    }

    const user: User = {
      id: 'mock-user-id-999',
      app_metadata: {},
      user_metadata: { name: email ? email.split('@')[0] : 'Safa Client' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: email || 'shariq-client@gmail.com',
      phone: phone || '+919876543210',
    };

    const session: Session = {
      access_token: 'mock-jwt-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };

    this.currentSession = session;
    if (typeof window !== 'undefined') {
      localStorage.setItem('safa-kurtilab-mock-session', JSON.stringify(session));
    }
    this.notify();
    return { data: { session, user }, error: null };
  }

  async signOut() {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('safa-kurtilab-mock-session');
    }
    this.notify();
    return { error: null };
  }

  async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    // Initial call
    callback(this.currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', this.currentSession);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
          },
        },
      },
    };
  }
}

const globalStore = globalThis as unknown as { __mockSupabaseAuth?: MockSupabaseAuth };

// Export real Supabase client or fallback to the Mock Auth client
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock.supabase.co')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (new Proxy(
        {},
        {
          get(target, prop) {
            if (prop === 'auth') {
              if (!globalStore.__mockSupabaseAuth) {
                globalStore.__mockSupabaseAuth = new MockSupabaseAuth();
              }
              return globalStore.__mockSupabaseAuth;
            }
            return () => {
              console.warn(`[Supabase Mock Warning] Method "${String(prop)}" called but not implemented in mock client.`);
              return Promise.resolve({ data: null, error: null });
            };
          },
        }
      ) as ReturnType<typeof createClient>);
