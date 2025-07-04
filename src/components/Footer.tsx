
export const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-slate-900/50 border-t border-slate-800">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-slate-400 text-lg">
          Created with{" "}
          <span className="text-red-400 text-xl animate-pulse">❤️</span>
          {" "}by{" "}
          <span className="text-white font-semibold">Barathraj</span>
          {" "}—{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
            BarathAI
          </span>
          {" "}© 2025
        </p>
      </div>
    </footer>
  );
};
