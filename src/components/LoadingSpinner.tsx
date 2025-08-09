import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ice-blue via-white to-steel-gray/10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 border-4 border-steel-blue/20 rounded-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.2 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-t-steel-blue border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        <p className="text-steel-blue font-semibold">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;