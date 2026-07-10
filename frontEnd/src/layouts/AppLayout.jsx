import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { Header } from "./Header.jsx";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      {/* Main content — offset for sidebar on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
