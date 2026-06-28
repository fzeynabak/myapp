import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Coins, 
  AlertTriangle,
  ArrowDownCircle,
  UserPlus,
  FolderPlus,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (window.electronAPI?.getDashboardData) {
          const res = await window.electronAPI.getDashboardData();
          if (res && res.success) {
            setData(res);
          } else {
            console.error('Failed to load dashboard data:', res?.error);
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number | string) => {
    const num = parseFloat(String(val)) || 0;
    return num.toLocaleString('fa-IR');
  };

  const stats = [
    { 
      label: 'مشتریان فعال', 
      value: (data?.customersCount || 0).toLocaleString('fa-IR'), 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-100 dark:bg-blue-900/40' 
    },
    { 
      label: 'کل محصولات', 
      value: (data?.productsCount || 0).toLocaleString('fa-IR'), 
      icon: Package, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-100 dark:bg-indigo-900/40' 
    },
    { 
      label: 'فاکتورهای امروز', 
      value: (data?.todayInvoicesCount || 0).toLocaleString('fa-IR'), 
      icon: ShoppingCart, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-100 dark:bg-emerald-900/40' 
    },
    { 
      label: 'فروش امروز (ریال)', 
      value: formatCurrency(data?.todaySales || 0), 
      icon: DollarSign, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-100 dark:bg-amber-900/40' 
    },
    { 
      label: 'سود امروز (ریال)', 
      value: formatCurrency(data?.todayProfit || 0), 
      icon: Coins, 
      color: 'text-teal-600 dark:text-teal-400', 
      bg: 'bg-teal-100 dark:bg-teal-900/40' 
    },
    { 
      label: 'کالاهای کم موجودی', 
      value: (data?.lowStockCount || 0).toLocaleString('fa-IR'), 
      icon: AlertTriangle, 
      color: 'text-rose-600 dark:text-rose-400', 
      bg: 'bg-rose-100 dark:bg-rose-900/40' 
    },
  ];

  const quickActions = [
    { label: 'ثبت فروش جدید', path: '/sales/new-invoice', icon: ShoppingCart, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40' },
    { label: 'ثبت خرید جدید', path: '/inventory/control', icon: ArrowDownCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40' },
    { label: 'افزودن مشتری', path: '/persons/new', icon: UserPlus, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40' },
    { label: 'افزودن محصول', path: '/products/new', icon: FolderPlus, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40' },
    { label: 'ثبت هزینه', path: '/persons/debtors-creditors', icon: TrendingDown, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40' },
    { label: 'دریافت وجه', path: '/persons/debtors-creditors', icon: ArrowDownLeft, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/40' },
    { label: 'پرداخت وجه', path: '/persons/debtors-creditors', icon: ArrowUpRight, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40' },
  ];

  const recentTransactions = React.useMemo(() => {
    if (!data) return [];
    const txs: any[] = [];

    // Map Invoices
    (data.recentInvoices || []).forEach((inv: any) => {
      txs.push({
        id: `inv-${inv.id}`,
        rawDate: inv.date,
        date: inv.date ? new Date(inv.date).toLocaleDateString('fa-IR') : 'نامشخص',
        type: 'فروش کالا',
        typeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20',
        person: inv.customer_name || 'مشتری عمومی',
        amount: inv.final_amount,
        status: inv.status || 'تسویه نشده',
        statusColor: inv.status === 'پرداخت شده'
          ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
          : 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
      });
    });

    // Map Ledger
    (data.recentLedger || []).forEach((led: any) => {
      let label = 'تراکنش مالی';
      let typeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20';
      if (led.type === 'received') {
        label = 'دریافت وجه';
        typeColor = 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/20';
      } else if (led.type === 'paid') {
        label = 'پرداخت وجه';
        typeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20';
      } else if (led.type === 'adjustment') {
        label = 'تعدیل حساب';
        typeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      } else if (led.type === 'invoice_debit') {
        label = 'بدهکار فاکتور';
        typeColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20';
      }

      txs.push({
        id: `led-${led.id}`,
        rawDate: led.date || led.created_at,
        date: (led.date || led.created_at) ? new Date(led.date || led.created_at).toLocaleDateString('fa-IR') : 'نامشخص',
        type: label,
        typeColor: typeColor,
        person: led.person_name || 'شخص عمومی',
        amount: Math.abs(led.amount),
        status: 'ثبت شده',
        statusColor: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
      });
    });

    // Sort descending by rawDate
    return txs
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 6);
  }, [data]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3" dir="rtl">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">در حال بارگذاری داده‌های داشبورد حسابداری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">میز کار و داشبورد مدیریتی</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">نمای کلی تراز مالی، فروش روزانه، هشدارهای انبارداری و میانبرهای دسترسی سریع</p>
        </div>
        <div className="text-xs font-bold bg-indigo-50 dark:bg-slate-800/50 backdrop-blur px-3 py-2 rounded-full border border-indigo-100/50 dark:border-slate-750 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          آخرین بروزرسانی سیستم: اکنون (برخط دیتابیس)
        </div>
      </div>

      {/* 6 Real-time Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between gap-3 transition-all hover:scale-[1.02] hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-base font-black text-slate-800 dark:text-white mt-1 dir-ltr text-right truncate selection:bg-indigo-200">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions (عملیات سریع) */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 rounded bg-indigo-600"></div>
          <h3 className="text-md font-black text-slate-800 dark:text-white">عملیات سریع و میانبرها</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => navigate(act.path)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 cursor-pointer text-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md ${act.color}`}
            >
              <act.icon className="w-5 h-5 shrink-0" />
              <span className="text-[11.5px] font-black">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 rounded bg-indigo-600"></div>
              <h3 className="text-md font-black text-slate-800 dark:text-white">آخرین تراکنش‌ها (فروش و سند مالی)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-[11.5px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500">
                    <th className="pb-2.5 font-bold">تاریخ</th>
                    <th className="pb-2.5 font-bold">نوع تراکنش</th>
                    <th className="pb-2.5 font-bold">طرف حساب / شخص</th>
                    <th className="pb-2.5 font-bold text-left">مبلغ (ریال)</th>
                    <th className="pb-2.5 font-bold text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">هیچ تراکنش یا فاکتوری در سیستم ثبت نشده است.</td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="py-3 font-medium text-slate-500 dark:text-slate-450">{tx.date}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${tx.typeColor}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{tx.person}</td>
                        <td className="py-3 font-mono font-bold text-left text-slate-800 dark:text-white">{formatCurrency(tx.amount)}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tx.statusColor}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {recentTransactions.length > 0 && (
            <button 
              onClick={() => navigate('/sales/history')}
              className="mt-4 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5 self-start cursor-pointer"
            >
              <span>مشاهده کل فاکتورها و تاریخچه</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* System Alerts */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-md font-black text-slate-800 dark:text-white">هشدارهای سیستم</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px]">
            {/* Low stock alerts */}
            <div className="p-3 bg-rose-50/40 dark:bg-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-900/20">
              <span className="text-xs font-black text-rose-700 dark:text-rose-450 block mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>کالاهای کم موجودی ({data?.lowStockCount?.toLocaleString('fa-IR') || '۰'})</span>
              </span>
              {data?.lowStockProducts?.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">موجودی تمامی کالاها در وضعیت مطلوب است.</p>
              ) : (
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                  {data?.lowStockProducts?.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center text-[11px] bg-white/40 dark:bg-slate-900/40 px-2 py-1 rounded">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{p.name}</span>
                      <span className="font-mono text-rose-600 font-bold">
                        {p.total_stock?.toLocaleString('fa-IR')} {p.unit || 'عدد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unpaid invoices */}
            <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
              <span className="text-xs font-black text-amber-700 dark:text-amber-450 block mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>فاکتورهای پرداخت نشده ({data?.unpaidInvoices?.length?.toLocaleString('fa-IR') || '۰'})</span>
              </span>
              {data?.unpaidInvoices?.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">تمامی فاکتورها به طور کامل تسویه شده‌اند.</p>
              ) : (
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                  {data?.unpaidInvoices?.slice(0, 4).map((inv: any) => (
                    <div key={inv.id} className="flex justify-between items-center text-[11px] bg-white/40 dark:bg-slate-900/40 px-2 py-1 rounded">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">فاکتور {inv.invoice_number} ({inv.customer_name})</span>
                      <span className="font-mono text-amber-600 font-bold">
                        {formatCurrency(inv.final_amount)} ریال
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer debts */}
            <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
              <span className="text-xs font-black text-blue-700 dark:text-blue-450 block mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>بدهکاران سیستم ({data?.customerDebts?.length?.toLocaleString('fa-IR') || '۰'})</span>
              </span>
              {data?.customerDebts?.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">هیچ بدهکاری با تراز منفی یافت نشد.</p>
              ) : (
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                  {data?.customerDebts?.slice(0, 4).map((debtor: any) => (
                    <div key={debtor.id} className="flex justify-between items-center text-[11px] bg-white/40 dark:bg-slate-900/40 px-2 py-1 rounded">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{debtor.name}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatCurrency(debtor.debt)} ریال
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Charts (Preserving Existing Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col">
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
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col">
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
