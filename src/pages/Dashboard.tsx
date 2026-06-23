import React from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const stats = [
    { label: 'کل مشتریان', value: '۱,۲۵۰', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    { label: 'محصولات', value: '۳۴۰', icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    { label: 'فاکتورهای امروز', value: '۱۵', icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
    { label: 'درآمد کل (تومان)', value: '۸۵,۰۰۰,۰۰۰', icon: DollarSign, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  ];

  const salesData = [
    { name: 'فروردین', sales: 4000, expenses: 2400 },
    { name: 'اردیبهشت', sales: 3000, expenses: 1398 },
    { name: 'خرداد', sales: 2000, expenses: 9800 },
    { name: 'تیر', sales: 2780, expenses: 3908 },
    { name: 'مرداد', sales: 1890, expenses: 4800 },
    { name: 'شهریور', sales: 2390, expenses: 3800 },
  ];

  const pieData = [
    { name: 'لوازم خانگی', value: 400 },
    { name: 'دیجیتال', value: 300 },
    { name: 'پوشاک', value: 300 },
    { name: 'خوراکی', value: 200 },
  ];
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 text-sm dir-rtl">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4">
              <span>{entry.name === 'sales' ? 'فروش:' : 'هزینه:'}</span>
              <span className="font-mono">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">داشبورد خلاصه</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نمای کلی از وضعیت فروشگاه و حسابداری</p>
        </div>
        <div className="text-xs font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
          آخرین بروزرسانی: الان
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1 dir-ltr text-right">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">نمودار فروش و هزینه (۶ ماه گذشته)</h3>
          <div className="flex-1 min-h-[300px] w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" name="فروش" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" name="هزینه" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">سهم فروش دسته‌بندی‌ها</h3>
          <div className="flex-1 min-h-[300px] w-full flex items-center justify-center dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
