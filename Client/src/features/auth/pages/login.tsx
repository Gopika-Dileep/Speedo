import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authapi";
import { setCredentials } from "../../../store/slice/authSlice";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const data = await login(form.email, form.password);
            dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#A7F3D0] to-[#7DD3FC] p-4 font-sans">
            <div className="bg-white px-8 py-10 md:px-10 md:py-12 rounded-3xl shadow-lg w-full max-w-[420px] flex flex-col items-center">
                
                {/* Logo & Brand */}
                <div className="flex items-center gap-2 mb-8">
                    <svg 
                        className="w-9 h-9 text-[#0F172A]" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                    >
                        {/* Speedometer outer arc */}
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5a8.25 8.25 0 0 1 16.5 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25h-7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 17.25h-7.5" />
                        {/* Speedometer ticks */}
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M6.3 6.3l1.1 1.1M17.7 6.3l-1.1 1.1M3.75 13.5H5.25M18.75 13.5H20.25" />
                        {/* Speedometer needle */}
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 12.5l3.5-4" />
                    </svg>
                    <span className="text-2xl font-black text-[#0F172A] tracking-tight">Speedo</span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 self-start">
                            Email
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Example@email.com" 
                            value={form.email} 
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-lg py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7DD3FC] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 self-start">
                            Password
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="At least 8 characters" 
                            value={form.password} 
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-lg py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7DD3FC] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] disabled:bg-slate-600 text-sm mt-2"
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
