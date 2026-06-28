import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import { 
  ArrowLeft, 
  User, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Scale, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BookOpen, 
  AlertCircle, 
  Sliders, 
  Layers, 
  Clock,
  Briefcase
} from 'lucide-react';
import JalaliDatePicker, { toPersianDigits, getTodayJalali } from '../components/JalaliDatePicker';

// Simple helper to format currency in Rial with Persian digits
export const formatPersianCurrency = (amount: number): string => {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('fa-IR');
  return formatted;
};

// Shamsi date picker helper (defaulting to current Shamsi date for transactions)
const getTodayShamsi = () => {
  const t = getTodayJalali();
  return `${t.y}/${String(t.m).padStart(2, '0')}/${String(t.d).padStart(2, '0')}`;
};

interface PersonSummary {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  phone1: string;
  type: string;
  accounting_code: string;
  financial_balance: number; // positive = debtor (بدهکار), negative = creditor (بستانکار)
  goods_balances: any[];
  total_goods_old_val: number;
  total_goods_new_val: number;
  active_deposits_count: number;
  quotas_count: number;
  has_active_items: boolean;
}

export default function DebtorsCreditors() {
  // Page states
  const [persons, setPersons] = useState<PersonSummary[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debtors' | 'creditors' | 'has_goods'>('all');
  
  // Selected Person Detail view
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'goods' | 'invoices'>('overview');

  // Quotas & ledger states inside person detail
  const [quotas, setQuotas] = useState<any[]>([]);
  const [goodsTransactions, setGoodsTransactions] = useState<any[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);
  const [personInvoices, setPersonInvoices] = useState<any[]>([]);

  // Modals / Quick forms toggle states
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showGoodsTxModal, setShowGoodsTxModal] = useState(false);
  const [showFinancialTxModal, setShowFinancialTxModal] = useState(false);

  // Form Fields State
  const [quotaForm, setQuotaForm] = useState({
    product_id: '',
    quota_quantity: '',
    period_name: getTodayShamsi(),
    description: ''
  });

  const [goodsTxForm, setGoodsTxForm] = useState({
    product_id: '',
    quantity_change: '',
    type: 'withdrawal', // 'deposit' (امانت‌گذاری/ثبت سهمیه) or 'withdrawal' (تحویل گرفتن کالا)
    unit_price_at_transaction: '',
    date: getTodayShamsi(),
    description: ''
  });

  const [financialTxForm, setFinancialTxForm] = useState({
    type: 'received', // 'received' (دریافت نقدی - بستانکار شدن مشتری), 'paid' (پرداخت نقدی - بدهکار شدن مشتری), 'adjustment' (تعدیل حساب)
    amount: '',
    date: getTodayShamsi(),
    description: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPersonId) {
      loadPersonDetails(selectedPersonId);
    }
  }, [selectedPersonId, persons]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (window.electronAPI?.getDebtorsCreditorsSummary) {
        const data = await window.electronAPI.getDebtorsCreditorsSummary();
        setPersons(data);
      }
      if (window.electronAPI?.getProducts) {
        const prodData = await window.electronAPI.getProducts();
        setProducts(prodData);
      }
    } catch (error) {
      console.error('Error loading summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonDetails = async (id: number) => {
    try {
      // Find person from list
      const p = persons.find(item => item.id === id);
      if (p) {
        setSelectedPerson(p);
      }

      // 1. Load Quotas
      if (window.electronAPI?.getPersonQuotas) {
        const qList = await window.electronAPI.getPersonQuotas(id);
        setQuotas(qList);
      }

      // 2. Load Goods Ledger
      if (window.electronAPI?.getPersonGoodsTransactions) {
        const glList = await window.electronAPI.getPersonGoodsTransactions(id);
        setGoodsTransactions(glList);
      }

      // 3. Load Financial Ledger
      if (window.electronAPI?.getPersonFinancialTransactions) {
        const ftList = await window.electronAPI.getPersonFinancialTransactions(id);
        setFinancialTransactions(ftList);
      }

      // 4. Load Sales Invoices
      if (window.electronAPI?.getInvoices) {
        const allInvoices = await window.electronAPI.getInvoices();
        const pInvoices = allInvoices.filter(inv => inv.customer_id === id);
        setPersonInvoices(pInvoices);
      }
    } catch (err) {
      console.error('Error loading person details:', err);
    }
  };

  // Quota handlers
  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !quotaForm.product_id || !quotaForm.quota_quantity) return;

    try {
      if (window.electronAPI?.savePersonQuota) {
        const res = await window.electronAPI.savePersonQuota({
          person_id: selectedPersonId,
          product_id: parseInt(quotaForm.product_id),
          quota_quantity: parseFloat(quotaForm.quota_quantity),
          period_name: quotaForm.period_name,
          description: quotaForm.description
        });

        if (res.success) {
          setShowQuotaModal(false);
          setQuotaForm({ product_id: '', quota_quantity: '', period_name: getTodayShamsi(), description: '' });
          // Reload
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error('Error saving quota:', err);
    }
  };

  const handleDeleteQuota = async (id: number) => {
    if (!window.confirm('آیا از حذف این سهمیه اطمینان دارید؟')) return;
    try {
      if (window.electronAPI?.deletePersonQuota) {
        const res = await window.electronAPI.deletePersonQuota(id);
        if (res.success) {
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Goods Transaction handlers
  const handleAddGoodsTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !goodsTxForm.product_id || !goodsTxForm.quantity_change) return;

    try {
      if (window.electronAPI?.addPersonGoodsTransaction) {
        const qty = parseFloat(goodsTxForm.quantity_change);
        // withdrawal is a negative change (quantity goes down from warehouse/balance), deposit is a positive change
        const finalQty = goodsTxForm.type === 'withdrawal' ? -qty : qty;

        const res = await window.electronAPI.addPersonGoodsTransaction({
          person_id: selectedPersonId,
          product_id: parseInt(goodsTxForm.product_id),
          quantity_change: finalQty,
          type: goodsTxForm.type,
          unit_price_at_transaction: parseFloat(goodsTxForm.unit_price_at_transaction || '0'),
          date: goodsTxForm.date,
          description: goodsTxForm.description
        });

        if (res.success) {
          setShowGoodsTxModal(false);
          setGoodsTxForm({
            product_id: '',
            quantity_change: '',
            type: 'withdrawal',
            unit_price_at_transaction: '',
            date: getTodayShamsi(),
            description: ''
          });
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error('Error saving goods transaction:', err);
    }
  };

  const handleDeleteGoodsTx = async (id: number) => {
    if (!window.confirm('آیا از حذف این تراکنش کالا اطمینان دارید؟')) return;
    try {
      if (window.electronAPI?.deletePersonGoodsTransaction) {
        const res = await window.electronAPI.deletePersonGoodsTransaction(id);
        if (res.success) {
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Financial Transaction handlers
  const handleAddFinancialTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !financialTxForm.amount) return;

    try {
      if (window.electronAPI?.addPersonFinancialTransaction) {
        const rawAmount = parseFloat(financialTxForm.amount);
        // received = customer paid us cash (we credit them = amount decreases / negative)
        // paid = we paid customer cash / loan (we debit them = amount increases / positive)
        // adjustment = custom entry
        let finalAmount = rawAmount;
        if (financialTxForm.type === 'received') {
          finalAmount = -rawAmount; // credit
        } else if (financialTxForm.type === 'paid') {
          finalAmount = rawAmount; // debit
        }

        const res = await window.electronAPI.addPersonFinancialTransaction({
          person_id: selectedPersonId,
          date: financialTxForm.date,
          type: financialTxForm.type,
          amount: finalAmount,
          description: financialTxForm.description
        });

        if (res.success) {
          setShowFinancialTxModal(false);
          setFinancialTxForm({
            type: 'received',
            amount: '',
            date: getTodayShamsi(),
            description: ''
          });
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error('Error saving financial transaction:', err);
    }
  };

  const handleDeleteFinancialTx = async (id: number) => {
    if (!window.confirm('آیا از حذف این سند مالی اطمینان دارید؟')) return;
    try {
      if (window.electronAPI?.deletePersonFinancialTransaction) {
        const res = await window.electronAPI.deletePersonFinancialTransaction(id);
        if (res.success) {
          await loadInitialData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats Calculations for Dashboard
  const calculateStats = () => {
    let totalDebtorsSum = new Decimal(0);
    let totalCreditorsSum = new Decimal(0);
    let totalOldGoodsVal = new Decimal(0);
    let totalNewGoodsVal = new Decimal(0);

    persons.forEach(p => {
      const bal = p.financial_balance;
      if (bal > 0) {
        totalDebtorsSum = totalDebtorsSum.add(bal);
      } else if (bal < 0) {
        totalCreditorsSum = totalCreditorsSum.add(Math.abs(bal));
      }

      totalOldGoodsVal = totalOldGoodsVal.add(p.total_goods_old_val || 0);
      totalNewGoodsVal = totalNewGoodsVal.add(p.total_goods_new_val || 0);
    });

    const netCashFlow = totalDebtorsSum.minus(totalCreditorsSum);
    const inflationDifference = totalNewGoodsVal.minus(totalOldGoodsVal);

    return {
      totalDebtors: totalDebtorsSum.toNumber(),
      totalCreditors: totalCreditorsSum.toNumber(),
      netCash: netCashFlow.toNumber(),
      goodsOldVal: totalOldGoodsVal.toNumber(),
      goodsNewVal: totalNewGoodsVal.toNumber(),
      inflationDiff: inflationDifference.toNumber()
    };
  };

  const stats = calculateStats();

  // Filters logic
  const filteredPersons = persons.filter(p => {
    // Search filter
    const q = searchTerm.toLowerCase().trim();
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const nickname = (p.nickname || '').toLowerCase();
    const phone = (p.phone1 || '').toLowerCase();
    const accCode = (p.accounting_code || '').toLowerCase();
    
    const matchesSearch = !q || fullName.includes(q) || nickname.includes(q) || phone.includes(q) || accCode.includes(q);

    if (!matchesSearch) return false;

    // Type filter
    if (filterType === 'debtors') {
      return p.financial_balance > 10;
    }
    if (filterType === 'creditors') {
      return p.financial_balance < -10;
    }
    if (filterType === 'has_goods') {
      return p.active_deposits_count > 0 || p.quotas_count > 0;
    }
    return true;
  });

  return (
    <div id="debtors_creditors_page" className="p-4 lg:p-6 bg-slate-50 dark:bg-slate-950 font-sans min-h-screen text-slate-800 dark:text-slate-100 space-y-6">
      
      {/* Header and Back Button if inside detail view */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-500" />
            <span>حساب‌های معین (بدهکاران، بستانکاران و امانات کالایی)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
            مدیریت پیشرفته مانده حساب‌های مالی، ثبت حواله‌های دریافتی/پرداختی، تعریف سهمیه‌های ماهیانه و رهگیری امانات کالایی به نرخ تاریخی و بازار.
          </p>
        </div>

        {selectedPersonId !== null && (
          <button
            onClick={() => {
              setSelectedPersonId(null);
              setSelectedPerson(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200/50 dark:border-slate-800 self-start"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>بازگشت به لیست اصلی</span>
          </button>
        )}
      </div>

      {selectedPersonId === null ? (
        /* ==================== SCREEN 1: MAIN LIST & DASHBOARD METRICS ==================== */
        <div className="space-y-6">
          
          {/* Quick Stats Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Debtors */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-rose-500 tracking-wider">طلب کل ما از مشتریان (بدهکاران)</span>
                <span className="block text-xl font-black text-slate-800 dark:text-white mt-1">
                  {formatPersianCurrency(stats.totalDebtors)} <span className="text-[11px] font-normal text-slate-400">ریال</span>
                </span>
                <span className="block text-[9px] text-slate-400">مجموع مانده حساب‌های مثبت</span>
              </div>
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Total Creditors */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-emerald-500 tracking-wider">بدهی ما به بازار (بستانکاران)</span>
                <span className="block text-xl font-black text-slate-800 dark:text-white mt-1">
                  {formatPersianCurrency(stats.totalCreditors)} <span className="text-[11px] font-normal text-slate-400">ریال</span>
                </span>
                <span className="block text-[9px] text-slate-400">مجموع مانده حساب‌های منفی</span>
              </div>
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Valuation Historical Goods */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-blue-500 tracking-wider">ارزش امانات به نرخ خرید قدیم</span>
                <span className="block text-lg font-bold text-slate-700 dark:text-slate-200 mt-1">
                  {formatPersianCurrency(stats.goodsOldVal)} <span className="text-[10px] font-normal text-slate-400">ریال</span>
                </span>
                <span className="block text-[9px] text-slate-400">مجموع ارزش در زمان سپرده‌گذاری</span>
              </div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Valuation Current Goods (Inflation Alert!) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-violet-500 tracking-wider">ارزش امانات به نرخ روز بازار</span>
                <span className="block text-lg font-bold text-slate-800 dark:text-white mt-1">
                  {formatPersianCurrency(stats.goodsNewVal)} <span className="text-[10px] font-normal text-slate-400">ریال</span>
                </span>
                {stats.inflationDiff > 0 ? (
                  <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ▲ افزایش ارزش تورمی: {formatPersianCurrency(stats.inflationDiff)} ریال
                  </span>
                ) : (
                  <span className="block text-[9px] text-slate-400">با احتساب آخرین بروزرسانی قیمت‌ها</span>
                )}
              </div>
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Filter Bar and List Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'all' 
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  همه اشخاص ({toPersianDigits(persons.length)})
                </button>
                <button
                  onClick={() => setFilterType('debtors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'debtors' 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  بدهکاران (طلب ما)
                </button>
                <button
                  onClick={() => setFilterType('creditors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'creditors' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  بستانکاران (بدهی ما)
                </button>
                <button
                  onClick={() => setFilterType('has_goods')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === 'has_goods' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  دارای امانت یا سهمیه کالا
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-72">
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام، تلفن، کدمعین..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

            {/* Main Table */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-3">کدمعین</th>
                      <th className="p-3">نام و نام خانوادگی</th>
                      <th className="p-3">تلفن تماس</th>
                      <th className="p-3 text-left">مانده حساب مالی</th>
                      <th className="p-3 text-center">تعداد امانات کالا</th>
                      <th className="p-3 text-center">سهمیه فعال</th>
                      <th className="p-3 text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPersons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-bold">
                          هیچ شخصی با شرایط فیلتر شده یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredPersons.map(p => {
                        const bal = p.financial_balance;
                        const isDebtor = bal > 10;
                        const isCreditor = bal < -10;
                        
                        return (
                          <tr 
                            key={p.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors group"
                          >
                            <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">
                              {toPersianDigits(p.accounting_code || `p-${p.id}`)}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => setSelectedPersonId(p.id)}
                                className="font-extrabold text-slate-800 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 text-right flex flex-col items-start gap-0.5"
                              >
                                <span>{p.first_name || ''} {p.last_name || ''}</span>
                                {p.nickname && <span className="text-[9px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">لقب: {p.nickname}</span>}
                              </button>
                            </td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                              {toPersianDigits(p.phone1 || 'ثبت نشده')}
                            </td>
                            <td className="p-3 text-left font-black font-mono">
                              {isDebtor ? (
                                <span className="text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                                  <span>{formatPersianCurrency(bal)}</span>
                                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/20">بدهکار (طلب ما)</span>
                                </span>
                              ) : isCreditor ? (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                                  <span>{formatPersianCurrency(Math.abs(bal))}</span>
                                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20">بستانکار (بدهی ما)</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">تسویه کامل</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold">
                              {p.active_deposits_count > 0 ? (
                                <span className="px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px]">
                                  {toPersianDigits(p.active_deposits_count)} قلم امانی
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold">
                              {p.quotas_count > 0 ? (
                                <span className="px-2 py-1 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 text-[10px]">
                                  {toPersianDigits(p.quotas_count)} مورد سهمیه
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-3 text-left">
                              <button
                                onClick={() => setSelectedPersonId(p.id)}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-200/40 dark:border-slate-800 font-bold"
                              >
                                مشاهده پرونده مالی
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ==================== SCREEN 2: INDIVIDUAL CUSTOMER DOSSIER / PROFILE ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Right/Side Block: Customer Profile Detail Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-150 dark:border-slate-850 shadow-xs space-y-5">
              
              {/* Profile Card Header */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                    {selectedPerson?.first_name || ''} {selectedPerson?.last_name || ''}
                  </h3>
                  {selectedPerson?.nickname && (
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {selectedPerson.nickname}
                    </span>
                  )}
                </div>
                <div className="font-mono text-[9px] text-slate-400 font-bold">
                  کد معین: {toPersianDigits(selectedPerson?.accounting_code || '')}
                </div>
              </div>

              {/* Quick Contacts details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>تلفن تماس:</span>
                  <strong className="font-mono text-slate-700 dark:text-slate-300">
                    {toPersianDigits(selectedPerson?.phone1 || 'ثبت نشده')}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>نوع شخص:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {selectedPerson?.type === 'vendor' ? 'فروشنده / تأمین‌کننده' : 'خریدار / مشتری'}
                  </span>
                </div>
              </div>

              {/* Highlight Financial & Goods Metrics */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">تراز نهایی مالی ریالی:</span>
                  <div className="text-base font-black">
                    {selectedPerson && selectedPerson.financial_balance > 10 ? (
                      <span className="text-rose-600 dark:text-rose-400 block font-mono">
                        {formatPersianCurrency(selectedPerson.financial_balance)} بدهکار <span className="text-[10px] font-normal text-slate-400">(طلب ما)</span>
                      </span>
                    ) : selectedPerson && selectedPerson.financial_balance < -10 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 block font-mono">
                        {formatPersianCurrency(Math.abs(selectedPerson.financial_balance))} بستانکار <span className="text-[10px] font-normal text-slate-400">(بدهی ما)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 block">تسویه بی‌حساب</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">ارزش کل امانات نزد ما:</span>
                  <div className="text-xs space-y-0.5 font-bold text-slate-700 dark:text-slate-300">
                    <p className="flex justify-between">
                      <span>به قیمت زمان تحویل:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">
                        {formatPersianCurrency(selectedPerson?.total_goods_old_val || 0)} <span className="text-[9px] font-normal">ریال</span>
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>به قیمت روز بازار:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatPersianCurrency(selectedPerson?.total_goods_new_val || 0)} <span className="text-[9px] font-normal">ریال</span>
                      </strong>
                    </p>
                  </div>
                </div>

              </div>

              {/* Dossier Quick actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setShowFinancialTxModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-black hover:opacity-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت دریافت / پرداخت نقدی</span>
                </button>
                <button
                  onClick={() => setShowGoodsTxModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/40 dark:border-slate-700"
                >
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                  <span>ثبت دریافت / تحویل امانت کالا</span>
                </button>
                <button
                  onClick={() => setShowQuotaModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-black hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-all border border-violet-200/30"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>تعریف سهمیه کالای ماهیانه</span>
                </button>
              </div>

            </div>
          </div>

          {/* Left/Main Block: Tabs & Detailed Data Tables */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Dossier Tabs Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-2 shadow-xs flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>داشبورد وضعیت</span>
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'financial'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>دفتر معین مالی (ریالی)</span>
              </button>
              <button
                onClick={() => setActiveTab('goods')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'goods'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>دفتر امانات و سهمیه‌های کالا</span>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>فاکتورهای فروش صادر شده</span>
              </button>
            </div>

            {/* Content for TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Visual Explanatory Alerts on Current Debts / Credits */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>خلاصه گزارش تفصیلی پرونده معین</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border space-y-1">
                      <span className="text-slate-400 block font-bold">تعداد کل فاکتورها</span>
                      <strong className="text-lg font-black block text-slate-700 dark:text-slate-300 font-mono">
                        {toPersianDigits(personInvoices.length)} فاکتور
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border space-y-1">
                      <span className="text-slate-400 block font-bold">کل مبلغ سهمیه‌ها</span>
                      <strong className="text-lg font-black block text-slate-700 dark:text-slate-300 font-mono">
                        {toPersianDigits(quotas.length)} محصول تعریف شده
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border space-y-1">
                      <span className="text-slate-400 block font-bold">باقی‌مانده سپرده فیزیکی کالا</span>
                      <strong className="text-lg font-black block text-slate-700 dark:text-slate-300 font-mono">
                        {toPersianDigits(selectedPerson?.active_deposits_count || 0)} واحد کالا
                      </strong>
                    </div>

                  </div>
                </div>

                {/* Quotas Real-time status list */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>سهمیه‌های کالایی دوره‌ای فعال</span>
                    </h4>
                    <button
                      onClick={() => setShowQuotaModal(true)}
                      className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400 rounded-lg text-[10px] font-bold transition-all"
                    >
                      + تخصیص سهمیه جدید
                    </button>
                  </div>

                  {quotas.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      هیچ سهمیه دوره‌ای یا ماهیانه برای این مشتری تعریف نشده است.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quotas.map(q => {
                        // Calculate how much they have already taken from this product in this period
                        // Let's sum the withdrawals for this product
                        const taken = Math.abs(goodsTransactions
                          .filter(tx => tx.product_id === q.product_id && tx.type === 'withdrawal')
                          .reduce((sum, tx) => sum + tx.quantity_change, 0));

                        const remaining = Math.max(0, q.quota_quantity - taken);
                        const progress = Math.min(100, (taken / q.quota_quantity) * 100);

                        return (
                          <div key={q.id} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-950/10 space-y-2 relative">
                            <button
                              onClick={() => handleDeleteQuota(q.id)}
                              className="absolute left-3 top-3 text-slate-400 hover:text-rose-500 transition-colors"
                              title="حذف سهمیه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-500">
                              دوره: {q.period_name}
                            </span>
                            <div className="font-extrabold text-xs text-slate-800 dark:text-white mt-1">
                              {q.product_name}
                            </div>
                            <div className="grid grid-cols-3 text-[11px] text-slate-500 pt-1 font-bold">
                              <div>کل سهمیه: <span className="text-slate-800 dark:text-white font-mono">{toPersianDigits(q.quota_quantity)} {q.product_unit}</span></div>
                              <div>برده شده: <span className="text-amber-600 font-mono">{toPersianDigits(taken)}</span></div>
                              <div>مانده: <span className="text-emerald-600 font-mono">{toPersianDigits(remaining)}</span></div>
                            </div>
                            {/* Simple Progress Bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Content for TAB 2: FINANCIAL LEDGER */}
            {activeTab === 'financial' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>گردش حساب مالی تفصیلی (ریالی)</span>
                  </h4>
                  <button
                    onClick={() => setShowFinancialTxModal(true)}
                    className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-black hover:opacity-90 transition-all"
                  >
                    + ثبت دریافت / پرداخت نقدی جدید
                  </button>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800">
                          <th className="p-3">تاریخ</th>
                          <th className="p-3">نوع سند</th>
                          <th className="p-3">شرح تراکنش مالی</th>
                          <th className="p-3 text-left">مبلغ بدهکار (بدهی مشتری)</th>
                          <th className="p-3 text-left">مبلغ بستانکار (پرداختی مشتری)</th>
                          <th className="p-3 text-left">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {/* Unpaid invoices displayed as Debit */}
                        {personInvoices.filter(inv => inv.status !== 'پرداخت شده').map(inv => (
                          <tr key={`inv-${inv.id}`} className="hover:bg-rose-50/5 dark:hover:bg-rose-950/5">
                            <td className="p-3 font-mono text-slate-400 font-bold">{toPersianDigits(inv.date.split(' ')[0] || '')}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-[10px] font-bold">فاکتور فروش</span>
                            </td>
                            <td className="p-3 font-extrabold">بابت فاکتور فروش شماره {toPersianDigits(inv.invoice_number)}</td>
                            <td className="p-3 text-left font-black text-rose-600 dark:text-rose-400 font-mono">
                              {formatPersianCurrency(inv.final_amount)} ریال
                            </td>
                            <td className="p-3 text-left text-slate-300">-</td>
                            <td className="p-3 text-left text-slate-300">-</td>
                          </tr>
                        ))}

                        {/* Manual financial ledger transactions */}
                        {financialTransactions.length === 0 && personInvoices.filter(inv => inv.status !== 'پرداخت شده').length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                              هیچ تراکنش مالی در دفتر معین این شخص ثبت نشده است.
                            </td>
                          </tr>
                        ) : (
                          financialTransactions.map(tx => {
                            const isDebit = tx.amount > 0; // بدهکار شدن مشتری (ما پرداخت کردیم)
                            const isCredit = tx.amount < 0; // بستانکار شدن مشتری (مشتری پرداخت کرده)
                            return (
                              <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                <td className="p-3 font-mono text-slate-400 font-bold">{toPersianDigits(tx.date)}</td>
                                <td className="p-3">
                                  {isDebit ? (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 text-[10px] font-bold">پرداخت نقدی</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold">دریافت وجه / رسید</span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{tx.description || 'ثبت دستی سند حسابداری'}</td>
                                <td className="p-3 text-left font-bold text-slate-700 dark:text-slate-300 font-mono">
                                  {isDebit ? `${formatPersianCurrency(tx.amount)} ریال` : '-'}
                                </td>
                                <td className="p-3 text-left font-bold text-slate-700 dark:text-slate-300 font-mono">
                                  {isCredit ? `${formatPersianCurrency(Math.abs(tx.amount))} ریال` : '-'}
                                </td>
                                <td className="p-3 text-left">
                                  <button
                                    onClick={() => handleDeleteFinancialTx(tx.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Content for TAB 3: GOODS & QUOTAS LEDGER */}
            {activeTab === 'goods' && (
              <div className="space-y-6">
                
                {/* Inflation valuation comparison bento */}
                <div className="bg-emerald-50/10 border border-emerald-100 dark:bg-emerald-950/5 dark:border-emerald-900/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">گزارش ارزش تورمی کل موجودی امانی</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    در بازار ایران به علت نوسانات شدید قیمت کالاها، محاسبه ارزش سپرده با نرخ تاریخی در مقایسه با نرخ روز بازار اهمیت فراوانی دارد. این جدول ارزش امانات مشتری را با قیمت اولیه و قیمت جدید نمایش می‌دهد.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">ارزش اولیه در فاکتورهای امانی:</span>
                      <strong className="text-lg font-black block text-slate-700 dark:text-slate-300 font-mono">
                        {formatPersianCurrency(selectedPerson?.total_goods_old_val || 0)} ریال
                      </strong>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">ارزش کنونی در بازار امروز:</span>
                      <strong className="text-lg font-black block text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatPersianCurrency(selectedPerson?.total_goods_new_val || 0)} ریال
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Goods ledger list */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span>تاریخچه خروج و سپرده کالایی (دفتر امانی کالا)</span>
                    </h4>
                    <button
                      onClick={() => setShowGoodsTxModal(true)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all"
                    >
                      + ثبت دریافت / تحویل کالا جدید
                    </button>
                  </div>

                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800">
                            <th className="p-3">تاریخ تراکنش</th>
                            <th className="p-3">کالا / خدمت</th>
                            <th className="p-3">نوع عملیات</th>
                            <th className="p-3 text-center">تعداد تغییر</th>
                            <th className="p-3 text-left">نرخ واحد زمان تراکنش</th>
                            <th className="p-3 text-left">نرخ واحد روز بازار</th>
                            <th className="p-3 text-left">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {goodsTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                                هیچ تراکنش کالایی (ورود/خروج امانی) برای این شخص ثبت نشده است.
                              </td>
                            </tr>
                          ) : (
                            goodsTransactions.map(tx => {
                              const isOut = tx.quantity_change < 0;
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                  <td className="p-3 font-mono text-slate-400 font-bold">{toPersianDigits(tx.date)}</td>
                                  <td className="p-3 font-bold text-slate-800 dark:text-white">{tx.product_name}</td>
                                  <td className="p-3">
                                    {isOut ? (
                                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-[10px] font-bold">خروج کالا (تحویل مشتری)</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 text-[10px] font-bold">ورود کالا (سپرده امانی)</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center font-bold font-mono">
                                    {isOut ? (
                                      <span className="text-rose-600 font-black">{toPersianDigits(tx.quantity_change)} {tx.product_unit}</span>
                                    ) : (
                                      <span className="text-blue-600 font-black">+{toPersianDigits(tx.quantity_change)} {tx.product_unit}</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-left font-mono text-slate-500">
                                    {formatPersianCurrency(tx.unit_price_at_transaction)} ریال
                                  </td>
                                  <td className="p-3 text-left font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    {formatPersianCurrency(tx.current_price)} ریال
                                  </td>
                                  <td className="p-3 text-left">
                                    <button
                                      onClick={() => handleDeleteGoodsTx(tx.id)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Content for TAB 4: INVOICE HISTORY */}
            {activeTab === 'invoices' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-xs space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>سابقه فاکتورهای فروش صادر شده برای خریدار</span>
                </h4>

                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800">
                          <th className="p-3">شماره سند</th>
                          <th className="p-3">تاریخ ثبت</th>
                          <th className="p-3 text-left">جمع فاکتور (ریال)</th>
                          <th className="p-3 text-center">روش پرداخت</th>
                          <th className="p-3 text-center">وضعیت تسویه</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {personInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                              هیچ فاکتوری برای این شخص ثبت نشده است.
                            </td>
                          </tr>
                        ) : (
                          personInvoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                              <td className="p-3 font-bold font-mono text-indigo-600 dark:text-indigo-450">#{toPersianDigits(inv.invoice_number)}</td>
                              <td className="p-3 font-mono text-slate-400">{toPersianDigits(inv.date)}</td>
                              <td className="p-3 text-left font-black font-mono">{formatPersianCurrency(inv.final_amount)} ریال</td>
                              <td className="p-3 text-center">{inv.payment_method || 'کارتخوان'}</td>
                              <td className="p-3 text-center">
                                {inv.status === 'پرداخت شده' ? (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold">تسویه شده</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-[10px] font-bold">بدهکار</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ==================== MODALS / QUICK FORM OVERLAYS ==================== */}

      {/* 1. Monthly Quota Assignment Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 pb-2 border-b">
              <Clock className="w-4 h-4 text-violet-500" />
              <span>تخصیص سهمیه کالای دوره‌ای جدید</span>
            </h3>
            
            <form onSubmit={handleSaveQuota} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">انتخاب کالا / سهمیه:</label>
                <select
                  required
                  value={quotaForm.product_id}
                  onChange={(e) => setQuotaForm(prev => ({ ...prev, product_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
                >
                  <option value="">-- انتخاب کالا --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit || 'عدد'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">مقدار کل سهمیه اختصاصی:</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quotaForm.quota_quantity}
                    onChange={(e) => setQuotaForm(prev => ({ ...prev, quota_quantity: e.target.value }))}
                    placeholder="مثلا ۴۰۰"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-left font-bold"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <JalaliDatePicker
                    value={quotaForm.period_name}
                    onChange={(val) => setQuotaForm(prev => ({ ...prev, period_name: val }))}
                    label="روز و دوره سهمیه (تاریخ):"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">توضیحات اختیاری:</label>
                <textarea
                  value={quotaForm.description}
                  onChange={(e) => setQuotaForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="مثال: حواله غله دولتی گندم آرد"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs h-16 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all"
                >
                  ثبت نهایی سهمیه
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuotaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Goods Deposit/Withdrawal Modal */}
      {showGoodsTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 pb-2 border-b">
              <Package className="w-4 h-4 text-blue-500" />
              <span>ثبت دریافت / تحویل امانت کالا</span>
            </h3>
            
            <form onSubmit={handleAddGoodsTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGoodsTxForm(prev => ({ ...prev, type: 'deposit' }))}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    goodsTxForm.type === 'deposit' 
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  ورود کالا (امانت‌گذاری جدید)
                </button>
                <button
                  type="button"
                  onClick={() => setGoodsTxForm(prev => ({ ...prev, type: 'withdrawal' }))}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    goodsTxForm.type === 'withdrawal' 
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  خروج کالا (تحویل تدریجی)
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">کالا یا خدمت مربوطه:</label>
                <select
                  required
                  value={goodsTxForm.product_id}
                  onChange={(e) => {
                    const prodId = e.target.value;
                    const selectedPr = products.find(p => p.id === parseInt(prodId));
                    setGoodsTxForm(prev => ({ 
                      ...prev, 
                      product_id: prodId,
                      unit_price_at_transaction: selectedPr ? selectedPr.price.toString() : ''
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
                >
                  <option value="">-- انتخاب کالا --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (آخرین قیمت: {formatPersianCurrency(p.price)} ریال)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">مقدار / تعداد کالا:</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={goodsTxForm.quantity_change}
                    onChange={(e) => setGoodsTxForm(prev => ({ ...prev, quantity_change: e.target.value }))}
                    placeholder="مثال: ۵۰"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-left font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">نرخ واحد معامله یا سپرده (ریال):</label>
                  <input
                    type="number"
                    required
                    value={goodsTxForm.unit_price_at_transaction}
                    onChange={(e) => setGoodsTxForm(prev => ({ ...prev, unit_price_at_transaction: e.target.value }))}
                    placeholder="۱۵۰,۰۰۰"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-left font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <JalaliDatePicker
                  value={goodsTxForm.date}
                  onChange={(val) => setGoodsTxForm(prev => ({ ...prev, date: val }))}
                  label="تاریخ ثبت تراکنش کالا (شمسی):"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">شرح یا بابت:</label>
                <textarea
                  value={goodsTxForm.description}
                  onChange={(e) => setGoodsTxForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="مثال: دریافت بخش اول سهمیه گندم به وزن ۵۰ کیلو"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs h-16 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all"
                >
                  ثبت تراکنش کالا
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoodsTxModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Manual Financial Receipt/Payment Modal */}
      {showFinancialTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 pb-2 border-b">
              <Scale className="w-4 h-4 text-emerald-500" />
              <span>ثبت سند دریافت / پرداخت نقدی</span>
            </h3>
            
            <form onSubmit={handleAddFinancialTx} className="space-y-4">
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFinancialTxForm(prev => ({ ...prev, type: 'received' }))}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    financialTxForm.type === 'received' 
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  دریافت وجه (بستانکار)
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialTxForm(prev => ({ ...prev, type: 'paid' }))}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    financialTxForm.type === 'paid' 
                      ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  پرداخت نقدی (بدهکار)
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialTxForm(prev => ({ ...prev, type: 'adjustment' }))}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    financialTxForm.type === 'adjustment' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  تعدیل حساب
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">مبلغ سند مالی (ریال):</label>
                <input
                  type="number"
                  required
                  value={financialTxForm.amount}
                  onChange={(e) => setFinancialTxForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="مبلغ به ریال"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-left font-bold"
                />
              </div>

              <JalaliDatePicker
                value={financialTxForm.date}
                onChange={(val) => setFinancialTxForm(prev => ({ ...prev, date: val }))}
                label="تاریخ ثبت سند مالی (شمسی):"
              />

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5">شرح تفصیلی سند:</label>
                <textarea
                  required
                  value={financialTxForm.description}
                  onChange={(e) => setFinancialTxForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="مثال: تصفیه نقدی بخشی از مانده بدهی فاکتورها"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs h-16 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-black transition-all"
                >
                  ثبت نهایی سند مالی
                </button>
                <button
                  type="button"
                  onClick={() => setShowFinancialTxModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
