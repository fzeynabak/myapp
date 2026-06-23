import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Layers, 
  Cpu, 
  Trash2, 
  Edit, 
  Archive, 
  AlertCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import Decimal from 'decimal.js';
import { Product } from '../types';

const MySwal = withReactContent(Swal);

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if (window.electronAPI?.getProducts) {
        const list = await window.electronAPI.getProducts();
        setProducts(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirm = await MySwal.fire({
      title: `آیا از حذف محصول "${product.name}" مطمئن هستید؟`,
      text: "تمام سطرهای انبارگردانی و فاکتور فروش‌های متصل ممکن است فاقد ارجاع شوند!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف'
    });

    if (confirm.isConfirmed) {
      try {
        if (window.electronAPI?.deleteProduct) {
          const res = await window.electronAPI.deleteProduct(product.id);
          if (res.success) {
            MySwal.fire('حذف شد', 'کالا با موفقیت از سیستم حذف گردید.', 'success');
            fetchProducts();
          }
        }
      } catch (e: any) {
        MySwal.fire('خطا', e.message || 'خطا در حذف کالا', 'error');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    navigate('/products/new', { state: { product } });
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.internal_sku && p.internal_sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.serial_number && p.serial_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && p.category_name === categoryFilter;
  });

  const uniqueCategories = Array.from(new Set(products.map(p => p.category_name).filter(Boolean)));

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      
      {/* Header control line */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-500" />
            <span>کاتالوگ و انبارگردانی محصولات</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده موجودی کل کالاها، ویرایش کاتالوگ قیمت‌ها، کدهای مرجع، بارکد، گارانتی و کنترل فیزیکی کالاها به تفکیک دسته‌بندی
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/products/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>افزودن محصول جدید</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-sm">
        
        {/* Statistics & Search bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام کالا، کد انبار، SKU، سریال..."
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-slate-850 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                همه دسته‌ها ({toPersianNum(products.length)})
              </button>
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-850 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-450 dark:text-slate-400 font-semibold">
            نمایش <b className="text-indigo-600 dark:text-indigo-400 font-bold">{toPersianNum(filteredProducts.length)}</b> مورد از مجموع کل محصولات کاتالوگ
          </div>
        </div>

        {/* Data Grid table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="p-3.5 w-16">ردیف</th>
                <th className="p-3.5">تصویر</th>
                <th className="p-3.5">کد انبار</th>
                <th className="p-3.5">عنوان محصول / خدمات</th>
                <th className="p-3.5">دسته‌بندی</th>
                <th className="p-3.5">برند</th>
                <th className="p-3.5 font-mono text-left">مبلغ خرید (ريال)</th>
                <th className="p-3.5 font-mono text-left">مبلغ تک‌فروشی (ريال)</th>
                <th className="p-3.5 text-center">موجودی کل</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <p className="text-sm">هیچ محصولی مطابق با شرایط جستجو یافت نشد.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-3.5 text-slate-400 text-center font-mono">{toPersianNum(idx + 1)}</td>
                    <td className="p-3.5">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                        {p.image_base64 ? (
                          <img src={p.image_base64} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-450 stroke-[1.5]" />
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-400">{toPersianNum(p.code)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-800 dark:text-white text-sm">{p.name}</div>
                        {p.type === 'service' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100/70 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200/20">خدمات</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 border border-emerald-200/20">کالا</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        {p.internal_sku && <span>SKU: {toPersianNum(p.internal_sku)}</span>}
                        {p.serial_number && <span>S/N: {toPersianNum(p.serial_number)}</span>}
                        {p.type === 'service' && p.required_docs && JSON.parse(p.required_docs).length > 0 && (
                          <span className="text-indigo-600 bg-indigo-50 dark:bg-slate-950 px-1.5 py-0.5 rounded text-[8px] font-bold">
                            {toPersianNum(JSON.parse(p.required_docs).length)} مدرک الزامی
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {p.category_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold">
                          {p.category_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {p.brand_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
                          {p.brand_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-left text-teal-600 dark:text-teal-400">{formatCurrency(p.cost)}</td>
                    <td className="p-3.5 font-mono font-black text-left text-indigo-650 dark:text-indigo-400">{formatCurrency(p.price)}</td>
                    <td className="p-3.5 text-center">
                      {p.type === 'service' ? (
                        <span className="px-2 py-1 rounded-lg font-black text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                          بدون مرز انبار (خدمات)
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg font-black font-mono text-xs ${
                          p.total_stock > 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          p.total_stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400' :
                          'bg-red-100 text-red-800 dark:bg-red-955/20 dark:text-red-400'
                        }`}>
                          {toPersianNum(p.total_stock)} {p.unit || 'عدد'}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
                          title="ویرایش محصول"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                          title="حذف کالا"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
