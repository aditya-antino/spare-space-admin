export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary relative overflow-hidden flex items-center justify-center p-8">
            {/* Repeatable background pattern tiles */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='hsl(var(--primary))' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='8'/%3E%3Ccircle cx='0' cy='0' r='4'/%3E%3Ccircle cx='60' cy='0' r='4'/%3E%3Ccircle cx='0' cy='60' r='4'/%3E%3Ccircle cx='60' cy='60' r='4'/%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            {/* Floating geometric elements */}
            <div className="absolute top-20 left-20 w-12 h-12 border-2 border-primary/30 rotate-45 animate-pulse"></div>
            <div className="absolute top-40 right-32 w-8 h-8 bg-primary/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-32 left-16 w-6 h-6 bg-primary/30 rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 right-20 w-10 h-10 border-2 border-primary/40 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/3 left-8 w-4 h-4 bg-primary/40 animate-bounce" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-2/3 right-8 w-5 h-5 border border-primary/30 rotate-12 animate-pulse" style={{animationDelay: '0.8s'}}></div>

            {/* Main content container */}
            <div className="relative z-10 bg-card/80 backdrop-blur-sm border border-border shadow-xl rounded-3xl p-8 max-w-md w-full text-center">
                
                {/* Logo with glow effect */}
                <div className="mb-6 relative inline-block">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 to-primary/60 rounded-full opacity-20 blur-lg animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-primary-foreground font-bold text-2xl">GL</span>
                    </div>
                </div>

                {/* Main heading */}
                <h1 className="text-2xl font-semibold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Your Live Preview Will Appear Here
                </h1>

                {/* Subtitle */}
                <p className="text-muted-foreground mb-8 text-sm">
                    Chat with Golex AI to bring your idea to life.
                </p>

                {/* Interactive diagram with spinner and blocks */}
                <div className="mb-8 relative w-48 h-32 mx-auto">
                    {/* Code blocks */}
                    <div className="absolute top-2 left-4 w-12 h-8 bg-gradient-to-r from-muted to-accent rounded-lg border border-border shadow-sm animate-pulse" style={{animationDelay: '0s'}}></div>
                    <div className="absolute top-0 right-8 w-10 h-6 bg-gradient-to-r from-accent to-primary/20 rounded-md border border-border shadow-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-4 left-0 w-14 h-7 bg-gradient-to-r from-muted to-accent rounded-lg border border-border shadow-sm animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-0 right-4 w-11 h-8 bg-gradient-to-r from-accent to-primary/20 rounded-lg border border-border shadow-sm animate-pulse" style={{animationDelay: '1.5s'}}></div>

                    {/* Central spinner */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            {/* Outer spinning ring */}
                            <div className="w-12 h-12 border-3 border-border border-t-primary rounded-full animate-spin"></div>
                            {/* Inner dot */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Description text */}
                <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                    Golex helps you create interactive, frontend-only demos—perfect for pitches, reviews, or user walkthroughs.
                </p>

                {/* Status badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent px-4 py-2 rounded-full border border-border shadow-sm">
                    {/* Pulsing dot */}
                    <div className="relative">
                        <div className="w-3 h-3 bg-primary-foreground rounded-full shadow-md"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-primary-foreground/80 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-primary-foreground font-medium text-sm">Ready to build</span>
                </div>
            </div>

            {/* Additional decorative elements */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-30"></div>
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-30"></div>
        </div>
    );
}