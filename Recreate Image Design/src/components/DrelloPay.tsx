import { motion } from 'motion/react';
import { Construction, Zap, CreditCard, Shield } from 'lucide-react';

export function DrelloPay() {
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#ff8c42] to-[#ff9d5c] rounded-2xl flex items-center justify-center">
            <Construction className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <h2 className="text-gray-900 mb-3" style={{ fontSize: '32px' }}>
          Drello Pay
        </h2>
        
        <p className="text-gray-600 mb-8" style={{ fontSize: '18px' }}>
          Coming Soon!
        </p>

        <div className="bg-white rounded-2xl p-8 mb-6">
          <p className="text-gray-700 mb-6">
            We're building our own integrated payment solution to make paid voting even easier. 
            For now, you can use Flutterwave payment links when creating contests.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-[#fff5eb] rounded-lg"
            >
              <Zap className="w-6 h-6 text-[#ff8c42] mb-2" />
              <h4 className="text-gray-900 mb-1">Instant Payouts</h4>
              <p className="text-sm text-gray-600">
                Receive payments directly to your account
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-[#fff5eb] rounded-lg"
            >
              <CreditCard className="w-6 h-6 text-[#ff8c42] mb-2" />
              <h4 className="text-gray-900 mb-1">Multiple Methods</h4>
              <p className="text-sm text-gray-600">
                Accept cards, bank transfers, and more
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-[#fff5eb] rounded-lg"
            >
              <Shield className="w-6 h-6 text-[#ff8c42] mb-2" />
              <h4 className="text-gray-900 mb-1">Secure & Safe</h4>
              <p className="text-sm text-gray-600">
                Bank-level security for all transactions
              </p>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-[#ff8c42] rounded-full"
              />
            ))}
          </div>
          <span className="text-sm">Building something amazing</span>
        </div>
      </motion.div>
    </div>
  );
}
