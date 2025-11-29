import { TOKEN_SYMBOL } from "@/config";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  currency?: string;
  placeholder?: string;
  min?: string;
  step?: string;
}

export default function AmountInput({ 
  amount, 
  onAmountChange, 
  currency = TOKEN_SYMBOL,
  placeholder = "0.00",
  min = "0",
  step = "0.001"
}: AmountInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-emerald-700 mb-2">
        Amount ({currency})
      </label>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={min}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute right-3 top-3 text-emerald-600 font-medium">
          {currency}
        </div>
      </div>
      
      {/* Quick Amount Buttons */}
      <div className="flex space-x-2 mt-3">
        {['0.1', '0.5', '1.0'].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => onAmountChange(quickAmount)}
            className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-lg hover:bg-emerald-200 hover:text-emerald-900 transition-colors"
          >
            {quickAmount} {currency}
          </button>
        ))}
      </div>
    </div>
  );
}