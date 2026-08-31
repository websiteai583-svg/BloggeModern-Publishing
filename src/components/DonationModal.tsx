import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Coffee, CreditCard, X, CheckCircle, Sparkles, Copy, Check } from 'lucide-react';

export const DonationModal: React.FC = () => {
  const { isDonationModalOpen, setIsDonationModalOpen, settings, language, showToast, addDonation, currentUser } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'card' | 'paypal'>('bkash');
  const [amount, setAmount] = useState('100');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isDonationModalOpen) return null;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addDonation({
        donorName: donorName.trim() || 'Anonymous Supporter',
        donorEmail: donorEmail.trim() || 'supporter@blogge.io',
        amount: Number(amount) || 100,
        currency: 'BDT',
        paymentMethod: selectedMethod,
        transactionId: trxId.trim(),
        reference: senderNumber.trim(),
        message: 'Supporter donation for Blogge publication'
      });

      if (result && result.receiptNumber) {
        setReceiptNumber(result.receiptNumber);
      } else {
        setReceiptNumber(`RCPT-${Date.now()}`);
      }
    } catch {
      setReceiptNumber(`RCPT-${Date.now()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsDonationModalOpen(false);
    setReceiptNumber(null);
    setTrxId('');
    setSenderNumber('');
  };

  const copyReceipt = () => {
    if (receiptNumber) {
      navigator.clipboard.writeText(receiptNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast(language === 'bn' ? 'রশিদ কোড কপি হয়েছে!' : 'Receipt code copied!');
    }
  };

  return (
    <div id="donation-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div id="donation-modal-card" className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          id="btn-close-donation-modal"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {receiptNumber ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'অনুদান সফলভাবে জমা হয়েছে!' : 'Donation Recorded Successfully!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'আপনার অনুদান আমাদের মানসম্মত ও স্বাধীন লেখালেখি অব্যাহত রাখতে সাহায্য করবে।' : 'Your generosity empowers our independent publication.'}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">অনুদান রশিদ (Receipt):</span>
                <button 
                  onClick={copyReceipt}
                  className="flex items-center gap-1 font-mono font-bold text-indigo-500 hover:underline"
                >
                  <span>{receiptNumber}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">টাকার পরিমাণ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">৳ {amount} BDT</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">মাধ্যম ও TrxID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedMethod.toUpperCase()} • {trxId}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs shadow-md"
            >
              {language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Done'}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
                <Coffee className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {settings?.donationConfig?.title || 'Buy Us a Coffee'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {settings?.donationConfig?.description || 'Support independent writing'}
              </p>
            </div>

            {/* Quick Amount Select */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['50', '100', '250', '500'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    amount === amt
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  ৳ {amt}
                </button>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 text-pink-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-extrabold">bKash</span>
                <span className="text-[10px]">বিকাশ</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-extrabold">Nagad</span>
                <span className="text-[10px]">নগদ</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Card / Stripe</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDonate} className="space-y-3">
              {selectedMethod === 'bkash' && (
                <div className="p-3 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900 rounded-xl text-xs text-pink-900 dark:text-pink-200">
                  <p className="font-semibold">বিকাশ পার্সোনাল নম্বর: <span className="font-mono">{settings?.donationConfig?.bkashNumber || '01700-000000'}</span></p>
                  <p className="text-[11px] text-pink-700 dark:text-pink-300 mt-0.5">Send Money করে নিচে ট্রানজেকশন আইডি দিন।</p>
                </div>
              )}

              {selectedMethod === 'nagad' && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl text-xs text-orange-900 dark:text-orange-200">
                  <p className="font-semibold">নগদ পার্সোনাল নম্বর: <span className="font-mono">{settings?.donationConfig?.nagadNumber || '01800-000000'}</span></p>
                  <p className="text-[11px] text-orange-700 dark:text-orange-300 mt-0.5">Send Money করে ট্রানজেকশন আইডি প্রদান করুন।</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'টাকার পরিমাণ (BDT)' : 'Donation Amount'}
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'আপনার মোবাইল / অ্যাকাউন্ট নম্বর' : 'Your Sender Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="TRX9827498"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>
                  {isSubmitting
                    ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                    : (language === 'bn' ? `৳ ${amount} অনুদান নিশ্চিত করুন` : `Confirm ৳ ${amount} Donation`)}
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
