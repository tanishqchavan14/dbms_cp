import { Smile, Frown, Minus } from 'lucide-react';

interface SentimentChartProps {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const total = data.positive + data.negative + data.neutral;
  const positivePercent = total > 0 ? (data.positive / total) * 100 : 0;
  const negativePercent = total > 0 ? (data.negative / total) * 100 : 0;
  const neutralPercent = total > 0 ? (data.neutral / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Sentiment Distribution</h2>

      <div className="space-y-6">
        <SentimentBar
          icon={<Smile className="w-5 h-5 text-green-600" />}
          label="Positive"
          count={data.positive}
          percent={positivePercent}
          color="bg-green-500"
        />
        <SentimentBar
          icon={<Minus className="w-5 h-5 text-slate-600" />}
          label="Neutral"
          count={data.neutral}
          percent={neutralPercent}
          color="bg-slate-400"
        />
        <SentimentBar
          icon={<Frown className="w-5 h-5 text-red-600" />}
          label="Negative"
          count={data.negative}
          percent={negativePercent}
          color="bg-red-500"
        />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total Analyzed</span>
          <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

interface SentimentBarProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  percent: number;
  color: string;
}

function SentimentBar({ icon, label, count, percent, color }: SentimentBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{count}</span>
          <span className="text-sm font-semibold text-slate-900 w-12 text-right">
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
