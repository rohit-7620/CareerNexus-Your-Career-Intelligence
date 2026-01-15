import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { container: 'w-8 h-8', icon: 14, text: 'text-base' },
    default: { container: 'w-10 h-10', icon: 20, text: 'text-xl' },
    large: { container: 'w-16 h-16', icon: 32, text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center space-x-2">
      {/* Animated Logo Icon */}
      <motion.div
        className={`${currentSize.container} relative rounded-xl flex items-center justify-center overflow-hidden`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          animate={{
            background: [
              'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
              'linear-gradient(135deg, #ec4899 0%, #f59e0b 50%, #10b981 100%)',
              'linear-gradient(135deg, #f59e0b 0%, #10b981 50%, #3b82f6 100%)',
              'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
              'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Rotating shine effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
              'linear-gradient(225deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.3)',
              '0 0 40px rgba(236, 72, 153, 0.4)',
              '0 0 20px rgba(59, 130, 246, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Brain icon with subtle animation */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Brain className="text-white" size={currentSize.icon} strokeWidth={2.5} />
        </motion.div>

        {/* Floating sparkles */}
        <motion.div
          className="absolute top-1 right-1"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="text-yellow-300" size={currentSize.icon * 0.4} />
        </motion.div>

        <motion.div
          className="absolute bottom-1 left-1"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [-2, -4, -2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        >
          <TrendingUp className="text-green-300" size={currentSize.icon * 0.35} />
        </motion.div>
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className={`${currentSize.text} font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            CareerNexus
          </motion.span>
          {size === 'large' && (
            <motion.span
              className="ml-1 text-sm font-semibold text-purple-500"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              AI
            </motion.span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
