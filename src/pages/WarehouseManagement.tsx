import React, { useState, useEffect } from 'react';
import { 
  Warehouse as WarehouseIcon, 
  MapPin, 
  Plus, 
  Check, 
  Trash2, 
  FileText, 
  Archive, 
  Tag, 
  ChevronLeft, 
  Search,
  Package,
  CheckCircle,
  X,
  PlusCircle,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Decimal from 'decimal.js';
import { Warehouse, WarehouseStock } from '../types';

const MySwal = withReactContent(Swal);

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Warehouse form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWhForm, setNewWhForm] = useState({
    name: '',
    code: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      if (window.electronAPI?.getWarehouses) {
        const list = await window.electronAPI.getWarehouses();
        setWarehouses(list);
        if (list.length > 0) {
          // If already selected, update it
          if (selectedWarehouse) {
            const up = list.find(w => w.id === selectedWarehouse.id);
            if (up) {
              setSelectedWarehouse(up);
              fetchStocks(up.id);
              return;
            }
          }
          setSelectedWarehouse(list[0]);
          fetchStocks(list[0].id);
        } else {
          setSelectedWarehouse(null);
          setStocks([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStocks = async (warehouseId: number) => {
    try {
      if (window.electronAPI?.getWarehouseStocks) {
        const data = await window.electronAPI.getWarehouseStocks(warehouseId);
        setStocks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectWarehouse = (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    fetchStocks(wh.id);
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhForm.name || !newWhForm.code) {
      MySwal.fire('خطا', 'نام و کد انبار اجباری هستند.', 'warning');
      return;
    }

    try {
      if (window.electronAPI?.saveWarehouse) {
        const res = await window.electronAPI.saveWarehouse(newWhForm);
        if (res.success) {
          setShowAddModal(false);
          setNewWhForm({
            name: '',
            code: '',
            address: '',
            description: ''
          });
          MySwal.fire({
            icon: 'success',
            title: 'انبار ایجاد شد',
            text: 'انبار جدید با موفقیت به انبارداری سیستم اضافه شد.',
            timer: 1500,
            showConfirmButton: false
          });
          fetchWarehouses();
        }
      }
    } catch (e: any) {
      MySwal.fire('خطا', e.message || 'خطا در ثبت انبار جدید', 'error');
    }
  };

  const handleDeleteWarehouse = async (wh: Warehouse) => {
    if (wh.code === 'WH-01') {
      MySwal.fire('خطای دسترسی', 'انبار پیش‌فرض سیستم (مغازه/ویترین) قابل حذف نمی‌باشد.', 'error');
      return;
    }

    const confirm = await MySwal.fire({
      title: `آیا از حذف انبار "${wh.name}" اطمینان دارید؟`,
      text: "با حذف انبار، تمام سطرهای تخصیص کالا در این انبار حذف خواهند شد. این عمل قابل بازگشت نیست!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف شود',
      cancelButtonText: 'انصراف'
    });

    if (confirm.isConfirmed) {
      try {
        if (window.electronAPI?.deleteWarehouse) {
          const res = await window.electronAPI.deleteWarehouse(wh.id);
          if (res.success) {
            MySwal.fire('حذف شد', 'انبار با موفقیت حذف گردید.', 'success');
            if (selectedWarehouse?.id === wh.id) {
              setSelectedWarehouse(null);
            }
            fetchWarehouses();
          }
        }
      } catch (e: any) {
        MySwal.fire('خطا', e.message || 'خطا در حذف انبار', 'error');
      }
    }
  };

  const toPersianNum = (str: string | number) => {
    return String(str).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
  };

  const formatCurrency = (amount: number | string) => {
    try {
      const num = new Decimal(amount || 0).toFixed(0);
      return Number(num).toLocaleString('fa-IR');
    } catch {
      return Number(amount || 0).toLocaleString('fa-IR');
    }
  };

  const filteredStocks = stocks.filter(st => {
    return st.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           st.product_code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <WarehouseIcon className="w-7 h-7 text-indigo-500" />
            <span>مدیریت سیستم انبارداری مستقل</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ایجاد انبارهای متعدد (شعبه‌ها، ویترین، طبقه‌بندی‌های کالا)، نمایش تخصیص و تفکیک فیزیکی موجودی کل فروشگاه به سبک حرفه‌ای
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>ایجاد انبار جدید</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Right Menu: Warehouse cards list */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[calc(100vh-14rem)] shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <WarehouseIcon className="w-5 h-5 text-indigo-500" />
              <span>لیست انبارها ({toPersianNum(warehouses.length)})</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
            {warehouses.map(wh => {
              const isSelected = selectedWarehouse?.id === wh.id;
              return (
                <div
                  key={wh.id}
                  onClick={() => handleSelectWarehouse(wh)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 relative ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/10'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-sm">{wh.name}</h3>
                      <span className="text-[10px] text-slate-400 block font-mono font-bold mt-0.5">{toPersianNum(wh.code)}</span>
                    </div>

                    {wh.code !== 'WH-01' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWarehouse(wh);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md"
                        title="حذف انبار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {wh.address && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{wh.address}</span>
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>تعداد اقلام متمایز: <b className="text-slate-700 dark:text-white font-black">{toPersianNum(wh.unique_products || 0)}</b> کالا</span>
                    <span>موجودی فیزیکی کل: <b className="text-slate-700 dark:text-white font-black">{toPersianNum(wh.total_items || 0)}</b> عدد</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Side: Selected warehouse items stock cardbox */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWarehouse ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
              
              {/* Warehouse summary info */}
              <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-slate-850 dark:text-white">{selectedWarehouse.name} ({toPersianNum(selectedWarehouse.code)})</h2>
                  {selectedWarehouse.description && (
                    <p className="text-[11px] text-slate-400 mt-1 max-w-lg leading-relaxed">{selectedWarehouse.description}</p>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو کالا در این انبار..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Grid content list of stocks */}
              <div className="flex-1 overflow-y-auto pt-4 space-y-2 custom-scrollbar">
                {filteredStocks.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full space-y-3">
                    <Package className="w-12 h-12 stroke-[1.5] text-slate-350" />
                    <span className="text-xs">هیچ موجودی یا محصولی در این انبار یافت نشد.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredStocks.map(stock => (
                      <div
                        key={stock.id}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] font-bold text-slate-400">کد: {toPersianNum(stock.product_code)}</span>
                            <h4 className="font-bold text-slate-850 dark:text-white text-xs mt-0.5">{stock.product_name}</h4>
                          </div>

                          <span className="px-2 py-0.5 text-xs font-black rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-mono">
                            {toPersianNum(stock.quantity)} {stock.unit}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>قیمت خرید: <b className="font-bold text-slate-700 dark:text-white font-mono">{formatCurrency(stock.cost)}</b> ریال</span>
                          <span>قیمت فروش: <b className="font-bold text-slate-700 dark:text-white font-mono">{formatCurrency(stock.price)}</b> ریال</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full shadow-sm space-y-4">
              <WarehouseIcon className="w-12 h-12 stroke-[1.5] text-slate-350" />
              <h3 className="font-bold text-sm">هیچ انباری انتخاب نشده است</h3>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: CREATE WAREHOUSE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-right leading-relaxed"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-indigo-500" />
                <span>تعریف انبار فیزیکی جدید</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">کد انحصاری انبار (مانند WH-02)</label>
                <input
                  type="text"
                  required
                  value={newWhForm.code}
                  onChange={(e) => setNewWhForm({...newWhForm, code: e.target.value})}
                  placeholder="WH-02"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-mono text-left font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">نام انبار</label>
                <input
                  type="text"
                  required
                  value={newWhForm.name}
                  onChange={(e) => setNewWhForm({...newWhForm, name: e.target.value})}
                  placeholder="مثال: انبار ویترین یا انبار طبقه دوم"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">آدرس فیزیکی انبار</label>
                <input
                  type="text"
                  value={newWhForm.address}
                  onChange={(e) => setNewWhForm({...newWhForm, address: e.target.value})}
                  placeholder="خیابان جمهوری، اتاق شماره ۴"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">شرح انبار</label>
                <textarea
                  rows={2}
                  value={newWhForm.description}
                  onChange={(e) => setNewWhForm({...newWhForm, description: e.target.value})}
                  placeholder="توضیحات کلی برای پرسنل..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/20 -mx-5 -mb-5 p-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-850 rounded-lg transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/10 transition-all hover:-translate-y-0.5"
                >
                  ثبت انبار فیزیکی
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
