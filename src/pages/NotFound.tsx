import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "../components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-200 via-rose-100 to-pink-200 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 transition-colors duration-500">
      <div className="backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full border border-rose-100 dark:border-rose-800">
        <Logo size={64} className="mb-6" />
        <h1 className="text-7xl font-extrabold bg-gradient-to-r from-rose-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">404</h1>
        <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Page Not Found</p>
        <p className="text-base text-slate-600 dark:text-slate-300 mb-6">Sorry, the page you are looking for does not exist or has been moved.<br/>If you believe this is an error, please contact support.</p>
        <a href="/" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-rose-500 via-fuchsia-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 hover:shadow-rose-300 transition-transform duration-200">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
