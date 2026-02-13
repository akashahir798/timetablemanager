import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 bg-transparent backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
          S
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          SONA TTG
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost" className="text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10">
            Sign In
          </Button>
        </Link>
      </div>
    </nav>
  );
}
