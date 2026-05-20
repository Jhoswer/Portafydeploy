import { motion } from "framer-motion";
import BrandPanel from "../register/BrandPanel";

export default function LoginLayout({ children }) {
  return (
    <div
    className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden"
    >
      {/* Background blobs — mismos que Register */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-125 h-125 bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-112.5 h-112.5 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-fuchsia-600/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl bg-card/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden grid lg:grid-cols-[42%_1fr]"
      >
        {/* Panel izquierdo — compartido con Register */}
        <div className="hidden lg:block">
          <BrandPanel variant="login"/>
        </div>

        {/* Panel derecho — formulario de login */}
        <div className="relative p-6 sm:p-8 lg:p-9 flex flex-col justify-center">
          {children}
        </div>
      </motion.div>
    </div>
  );
}