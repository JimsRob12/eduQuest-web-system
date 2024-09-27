/* eslint-disable @typescript-eslint/no-explicit-any */
// import supabase from "@/services/supabase";
// import { useState, useEffect } from "react";

const Login: React.FC = () => {
  // const [email, setEmail] = useState<string>("");
  // const [password, setPassword] = useState<string>("");
  // const [session, setSession] = useState<any>(null);
  // const [error, setError] = useState<string>("");
  // useEffect(() => {
  //   const fetchInitialSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     setSession(session);
  //   };
  //   fetchInitialSession();
  //   // Subscribe to auth state changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === "SIGNED_IN") {
  //       setSession(session);
  //     } else if (event === "SIGNED_OUT") {
  //       setSession(null);
  //     }
  //   });
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);
  // // Function to handle email/password login
  // const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setError("");
  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });
  //   if (error) {
  //     setError(error.message);
  //   } else {
  //     setSession(data.session);
  //   }
  // };
  // // Function to handle Google OAuth login
  // const handleGoogleSignIn = async () => {
  //   setError("");
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //   });
  //   if (error) {
  //     setError(error.message);
  //   }
  // };
  // return (
  //   <div>
  //     {session ? (
  //       <div>
  //         <div>Logged in!</div>
  //         <button onClick={() => supabase.auth.signOut()}>Sign out</button>
  //       </div>
  //     ) : (
  //       <div>
  //         <h2>Login</h2>
  //         <form onSubmit={handleLogin}>
  //           <div>
  //             <label>Email</label>
  //             <input
  //               type="email"
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //               required
  //             />
  //           </div>
  //           <div>
  //             <label>Password</label>
  //             <input
  //               type="password"
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //               required
  //             />
  //           </div>
  //           <button type="submit">Login</button>
  //         </form>
  //         <div>
  //           <p>Or sign in with:</p>
  //           <button onClick={handleGoogleSignIn}>Sign in with Google</button>
  //         </div>
  //         {error && <p style={{ color: "red" }}>{error}</p>}
  //       </div>
  //     )}
  //   </div>
  // );
};

export default Login;
