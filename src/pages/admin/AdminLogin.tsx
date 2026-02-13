import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Eye, EyeOff, ArrowLeft, Loader2, Shield, Clock } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  department_id: string;
  is_active: boolean;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Admin Login - Timetable";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Login as Admin to manage your department's timetable.");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Query admin_users table to find the user
      const { data: adminUsers, error: queryError } = await (supabase as any)
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true);

      if (queryError) {
        console.error('Query error:', queryError);
        toast.error(`Login failed: ${queryError.message || queryError.details || 'Database error'}`);
        return;
      }

      if (!adminUsers || adminUsers.length === 0) {
        console.log('No admin users found for email:', email);
        toast.error("Invalid credentials or account not found");
        return;
      }

      console.log('Found admin user:', adminUsers[0]);

      const admin = adminUsers[0];

      // Verify password using the database function
      if (admin.password_hash) {
        const { data: isValid, error: verifyError } = await (supabase as any)
          .rpc('verify_password', {
            password: password,
            hashed_password: admin.password_hash
          });

        if (verifyError) {
          console.error('Password verification error:', verifyError);
          toast.error('Password verification failed');
          return;
        }

        if (isValid) {
          console.log('Password verified, logging in admin:', admin.email);
          // Store admin info in localStorage
          const adminData = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            department_id: admin.department_id,
            is_active: admin.is_active
          };

          localStorage.setItem("adminUser", JSON.stringify(adminData));
          console.log('Admin data stored in localStorage:', adminData);

          toast.success("Login successful");
          navigate("/admin", { replace: true });
        } else {
          console.log('Password verification failed for admin:', admin.email);
          toast.error("Invalid password");
        }
      } else {
        console.log('No password hash found for admin:', admin.email);
        toast.error("Account setup incomplete");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message?.includes('relation "admin_users" does not exist') ||
          error.message?.includes('admin_users')) {
        toast.error("Database setup incomplete. Please contact your Super Admin to set up the system.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* AI-Themed Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Clock-like circular patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-blue-400/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-32 left-32 w-24 h-24 border-2 border-purple-400/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 hover:-translate-x-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <section className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 relative">
              <Shield className="w-10 h-10 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-blue-200">Secure access to department management</p>
          </div>

          {/* Login Card */}
          <Card className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-blue-200/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-blue-200/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-purple-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Access Portal"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-blue-200 space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">AI-Powered Admin Access</span>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="text-purple-300 mt-0.5">•</span>
                      <span>Don't have an account? Contact your Super Admin to get access.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-300 mt-0.5">•</span>
                      <span>Use the email and password provided by your Super Admin.</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
