import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  UserCog,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Tab = "user" | "staff";
type Mode = "login" | "signup";

const HERO_IMAGE =
  "https://images.pexels.com/photos/7792841/pexels-photo-7792841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("user");
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for OAuth error passed back from the /auth/callback route
    const oauthError = searchParams.get("oauthError");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      // Clean the URL so the error param doesn't persist on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        setError(error);
        return;
      }
    }
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) {
      setError(error);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const isUser = tab === "user";
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-white sm:bg-[#f0f4f9] flex items-center justify-center p-0 sm:p-4 md:p-6">
      <div className="w-full sm:max-w-md mx-auto min-h-screen sm:min-h-0 bg-white sm:rounded-3xl sm:shadow-2xl sm:shadow-slate-300/60 overflow-hidden flex flex-col justify-center">
          {/* ── Hero image section ── */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={HERO_IMAGE}
              alt="Professional handshake"
              className="w-full h-full object-cover object-center"
            />
            {/* dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-900/50 to-transparent" />

            {/* Branding text */}
            <div className="absolute inset-x-0 top-0 px-5 pt-5">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-blue-200 uppercase">
                Government of Madhya Pradesh
              </p>
              <h1 className="text-white font-extrabold text-[22px] leading-tight mt-0.5 drop-shadow-lg">
                Success MP Online
              </h1>
              <p className="text-blue-100 text-[11px] font-medium mt-0.5 tracking-wide">
                Citizen Services Portal
              </p>
            </div>

            {/* Tricolor accent strip */}
            <div className="absolute bottom-0 inset-x-0 flex h-1">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>
          </div>

          {/* ── Circular logo badge ── */}
          <div className="flex justify-center -mt-9 relative z-10">
            <div className="w-[72px] h-[72px] rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center">
              <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex flex-col items-center justify-center gap-0.5">
                <ShieldCheck className="w-7 h-7 text-white" strokeWidth={1.8} />
                <span className="text-[7px] font-bold text-blue-100 tracking-widest uppercase leading-none">
                  MP ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* ── Form area ── */}
          <div className="px-6 pb-8 pt-4">
            {/* Portal tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-7">
              <TabButton
                active={isUser}
                icon={<User className="w-4 h-4" />}
                label="User Portal"
                sub="Citizen Services"
                onClick={() => switchTab("user")}
              />
              <TabButton
                active={!isUser}
                icon={<UserCog className="w-4 h-4" />}
                label="Staff Portal"
                sub="Staff / Admin"
                onClick={() => switchTab("staff")}
              />
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {isLogin ? "Login" : "Create Account"}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {isUser
                  ? isLogin
                    ? "Sign in to access citizen services"
                    : "Register as a new citizen user"
                  : isLogin
                  ? "Staff & admin access only"
                  : "Create a staff account"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1.5">
                    Full Name&nbsp;
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border-0 border-b-2 border-slate-200 focus:border-blue-600 bg-transparent pb-2 pt-1 text-slate-800 placeholder:text-slate-300 text-sm outline-none transition-colors"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1.5">
                  Email Address&nbsp;
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border-0 border-b-2 border-slate-200 focus:border-blue-600 bg-transparent pb-2 pt-1 text-slate-800 placeholder:text-slate-300 text-sm outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1.5">
                  Password&nbsp;
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border-0 border-b-2 border-slate-200 focus:border-blue-600 bg-transparent pb-2 pt-1 pr-8 text-slate-800 placeholder:text-slate-300 text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-0 p-1 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill Helper */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1 pb-1 px-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-800">
                  <span className="font-medium">Demo Acc: {isUser ? "Citizen" : "Admin"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isUser) {
                        setEmail("Divyanshuyadav1031@gmail.com");
                        setPassword("Divyanshu@07");
                      } else {
                        setEmail("admin@successmponline.in");
                        setPassword("Admin@123456");
                      }
                      setError(null);
                    }}
                    className="font-bold text-blue-700 hover:text-blue-900 underline ml-2"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* Forgot password */}
              {isLogin && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-700/25 text-sm tracking-wide mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Login" : "Create Account"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 absolute font-medium uppercase tracking-wider">
                Or
              </span>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-2xl transition-all shadow-sm text-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Switch mode */}
            <p className="text-center text-xs text-slate-400 mt-5">
              {isLogin ? "New to the portal? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(isLogin ? "signup" : "login");
                  setError(null);
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                {isLogin ? "Register here" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Bottom disclaimer */}
          <p className="text-center text-[11px] text-slate-400 mt-5 px-4 pb-4 sm:pb-0">
            Govt. of Madhya Pradesh authorised portal &mdash; All transactions are
            secured &amp; encrypted.
          </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 ${
        active
          ? "bg-blue-700 text-white shadow-lg shadow-blue-700/30"
          : "text-slate-500 hover:bg-slate-200"
      }`}
    >
      <span
        className={`flex items-center gap-1.5 font-bold text-sm ${
          active ? "text-white" : "text-slate-700"
        }`}
      >
        {icon}
        {label}
      </span>
      <span
        className={`text-[11px] font-medium ${
          active ? "text-blue-200" : "text-slate-400"
        }`}
      >
        {sub}
      </span>
    </button>
  );
}
