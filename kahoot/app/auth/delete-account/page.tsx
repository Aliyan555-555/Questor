'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeleteAccountForm() {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reason:', reason);
    console.log('Message:', message);
    setSubmitted(true);
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center bg-gray-100 px-4"
      style={{ backgroundImage: "url(/images/UI/error.jpg)" }}
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full p-6 bg-green-100 border border-green-300 text-green-800 rounded-2xl text-center shadow-lg backdrop-blur-lg"
          >
            <div className="text-2xl mb-2">✅</div>
            <h2 className="text-lg font-semibold">Request Submitted</h2>
            <p className="mt-2 text-sm">Your account deletion request has been received.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-left backdrop-blur-md bg-opacity-90"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Delete Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Reason
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="privacy">Privacy Concerns</option>
                  <option value="not-useful">Not Useful</option>
                  <option value="technical">Technical Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-red-400 focus:outline-none"
                  placeholder="Tell us more..."
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="w-full bg-[#D62829] text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-all duration-300"
              >
                Submit Request
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
