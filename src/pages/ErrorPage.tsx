import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Search } from "lucide-react";
import logo from "@/assets/logo.png";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex flex-col items-center justify-center selection:bg-primary/20">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20vw] h-[20vw] border border-primary/10 rounded-full opacity-20 animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-[15vw] h-[15vw] border border-primary/10 rounded-full opacity-20 animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">

        {/* Logo */}
        <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <img
            src={logo}
            alt="Logo"
            className="h-10 md:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* 404 Typography */}
        <div className="relative w-full">
          <h1 className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-bold text-foreground/5 leading-none select-none tracking-tighter animate-in zoom-in-95 duration-1000">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight mb-2 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Page Not Found
            </h2>
            <p className="max-w-xs md:max-w-md text-muted-foreground text-sm md:text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              The page you're looking for seems to have drifted into deep space.
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="group border-input hover:bg-muted/50 hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Footer Help */}
        <div className="mt-16 text-sm text-muted-foreground/60 animate-in fade-in duration-1000 delay-700">
          <p>Need help? <span className="text-primary cursor-pointer hover:underline" onClick={() => window.location.href = 'mailto:support@sopraspace.com'}>Contact Support</span></p>
        </div>
      </div>
    </div>
  );
}
