import { useState, useEffect } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import supabase from '../../../utils/supabase'; // Ensure you have your Supabase client initialized
import { checkEmailExists } from '@/supabase/util/checkEmail';
import { insertNewAccount } from '@/supabase/util/insertNewAccount';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  // Email/Password signup
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      // Check if the email already exists in the 'students' table
      const existingStudent = await checkEmailExists(email, "students");

      if (existingStudent) {
        setError('Email already exists in the students table.');
        return;
      }

      // Proceed with sign-up via Supabase's auth API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {

        setSuccess(true);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  // OAuth (Google) login/signup
  const handleGoogleSignIn = async () => {
    setError('');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  // Handle session change and check if user exists
  const handleSessionChange = async (newSession: Session | null) => {
    if (newSession?.user?.id) {
      const existingStudent = await checkEmailExists(newSession.user.email || "", "students");

      if (!existingStudent) {
        await insertNewAccount(newSession.user.id, newSession.user.email || "", "students");
      }
      setSession(newSession);
      setSuccess(true);
    } else {
      setSession(null);
    }
  };

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        handleSessionChange(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h2>Sign Up</h2>

      {success ? (
        <p>Sign up successful! Please check your email for confirmation.</p>
      ) : (
        <>
          {/* Email/Password Signup Form */}
          <form onSubmit={handleSignUp}>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>

          {/* OAuth Signup/Login with Google */}
          <div>
            <p>Or sign up with:</p>
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default SignupForm;
