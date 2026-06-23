import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  X, 
  Calendar, 
  CreditCard, 
  Coins, 
  Smartphone, 
  Info,
  Layers,
  Archive,
  ShoppingCart,
  CheckCircle2,
  Filter,
  FileText,
  AlertTriangle,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Decimal from 'decimal.js';
import { Invoice } from '../types';
import { CustomDesignedInvoice } from '../components/CustomDesignedInvoice';
import { InvoiceDesignerService } from '../utils/invoiceDesignerSettings';

const MySwal = withReactContent(Swal);

export default function SalesHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('همه');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printLayout, setPrintLayout] = useState<'a4' | 'a5' | 'thermal'>('a4');
  
  const [invoiceDesign, setInvoiceDesign] = useState<any>(null);
  const [printShopName, setPrintShopName] = useState('حسابداری مالی ملینا');
  const [printShopSlogan, setPrintShopSlogan] = useState('امور مالی و حسابداری یکپارچه ملینا');
  const [printShopAddress, setPrintShopAddress] = useState('تهران، بازار بزرگ، سرای ملی، طبقه اول، پلاک ۴');
  const [printShopPhone, setPrintShopPhone] = useState('۰۲۱-۵۵۶۶۷۷۸۸');
  const [printShopLogo, setPrintShopLogo] = useState('');

  useEffect(() => {
    loadInvoices();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      let loadedDesign = null;
      if (window.electronAPI?.getConfig) {
        const config = await window.electronAPI.getConfig();
        if (config) {
          if (config.invoiceDesignerPreset) {
            loadedDesign = config.invoiceDesignerPreset;
            setInvoiceDesign(config.invoiceDesignerPreset);
          }
          if (config.storeName) setPrintShopName(config.storeName);
          if (config.storeSlogan) setPrintShopSlogan(config.storeSlogan);
          if (config.storeAddress) setPrintShopAddress(config.storeAddress);
          if (config.storePhone) setPrintShopPhone(config.storePhone);
          if (config.storeLogo) setPrintShopLogo(config.storeLogo);
        }
      }
      if (!loadedDesign) {
        setInvoiceDesign(InvoiceDesignerService.get());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadInvoices = async () => {
    try {
      if (window.electronAPI?.getInvoices) {
        const list = await window.electronAPI.getInvoices();
        setInvoices(list);
      }
    } catch (e) {
      console.error('Error loading invoices history:', e);
    }
  };

  const handleCancelInvoice = async (invoiceId: number, invoiceNum: string) => {
    MySwal.fire({
      title: `آیا مایل به لغو فاکتور شماره ${invoiceNum} هستید؟`,
      text: 'با لغو فاکتور، کالاها به موجودی انبار بازگردانده شده و سند مالی برگشت می‌خورد. این فرآیند تحت حفاظت تراکنش‌های پایگاه‌داده است.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'بله، لغو و برگشت داده شود',
      cancelButtonText: 'انصراف'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (window.electronAPI?.deleteInvoice) {
            const res = await window.electronAPI.deleteInvoice(invoiceId);
            if (res.success) {
              MySwal.fire('لغو شد', 'فاکتور با موفقیت باطل گردید و موجودی انبارها به‌روزرسانی شد.', 'success');
              loadInvoices(); // reload history
            } else {
              throw new Error(res.error || 'خطا در لغو فاکتور');
            }
          }
        } catch (err: any) {
          MySwal.fire('خطا', err.message || 'لغو فاکتور با خطا مواجه شد.', 'error');
        }
      }
    });
  };

  const formatCurrency = (val: number | string | Decimal) => {
    const parsed = typeof val === 'object' ? val.toNumber() : parseFloat(val.toString() || '0');
    return parsed.toLocaleString('fa-IR');
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'همه' || inv.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const triggerPrintCmd = () => {
    window.print();
  };

  return (
    <div id="sales_history_page" className="p-4 lg:p-6 bg-slate-50 dark:bg-slate-950 font-sans min-h-screen text-slate-800 dark:text-slate-100 space-y-6">
      
      {/* Visual Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-500" />
            <span>تاریخچه و لغو اسناد فاکتورهای فروش</span>
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            مشاهده، چاپ مجدد و بررسی جزئیات فاکتورهای صادرشده تجاری و لغو اسناد فروشگاهی
          </p>
        </div>
      </div>

      {/* Instant Search Bar & Filter options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی سریع شماره فاکتور یا نام خریدار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-xs text-slate-800 dark:text-white transition-all font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            <span>فیلتر تسویه:</span>
          </span>
          {['همه', 'کارتخوان', 'نقدی', 'کارت به کارت', 'چکی', 'اقساطی'].map(method => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                methodFilter === method
                  ? 'bg-indigo-600 border border-indigo-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-150 py-2.5">
                <th className="p-3">ردیف</th>
                <th className="p-3">شمارة سند فاکتور</th>
                <th className="p-3">نام و مشخصات خریدار</th>
                <th className="p-3 text-center">نوع تسویه</th>
                <th className="p-3 text-left">مجموع ناخالص (ریال)</th>
                <th className="p-3 text-left">تخفیف (ریال)</th>
                <th className="p-3 text-left text-indigo-600 dark:text-indigo-400">مبلغ خالص دریافتی (ریال)</th>
                <th className="p-3 text-center">اقدامات چاپی و ابطال</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">هیچ فاکتوری با شرایط انتخابی ثبت نشده است.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => {
                  return (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800/40">
                      <td className="p-3 font-semibold">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{inv.invoice_number}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">{inv.customer_name}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {inv.payment_method}
                        </span>
                      </td>
                      <td className="p-3 text-left font-mono font-bold">{formatCurrency(inv.total_amount)}</td>
                      <td className="p-3 text-left font-mono font-bold text-red-500">-{formatCurrency(inv.discount)}</td>
                      <td className="p-3 text-left font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(inv.final_amount)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold text-[10px] flex items-center gap-1 transition-all"
                            title="مشاهده سند مالی و ابزار چاپ فاکتور"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>چاپ / نمایش</span>
                          </button>
                          
                          <button
                            onClick={() => handleCancelInvoice(inv.id!, inv.invoice_number)}
                            className="p-1 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-bold text-[10px] flex items-center gap-1 transition-all"
                            title="ابطال فاکتور و بازگرداندن اقلام فیزیکی کالا به انبار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ابطال فاکتور</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Printing Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* Print preview CSS block to guarantee 100% margin-free official prints */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* Strip all background colors, borders, and shadows from parent containers */
              html, body, #root, [role="dialog"], .fixed, .absolute, div, section, main {
                background: transparent !important;
                background-color: transparent !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
              }
              
              /* Default everything as hidden */
              body * {
                visibility: hidden !important;
              }

              /* Display and show only the printable invoice component */
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }

              /* Align the invoice on the physical page */
              #printable-invoice {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
                z-index: 9999999 !important;
              }

              /* Enforce background colors and images */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              @page {
                size: ${printLayout === 'a4' ? 'A4 portrait' : printLayout === 'a5' ? 'A5 portrait' : '80mm auto'};
                margin: ${printLayout === 'thermal' ? '0' : '8mm'} !important;
              }
            }
          `}} />

          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-500" />
                <span>بررسی نهایی و صدور مجدد فاکتور شماره {selectedInvoice.invoice_number}</span>
              </h3>
              <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Selection options */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap gap-2.5 items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'a4', label: 'کاغذ رسمی A4 (اداری)' },
                  { id: 'a5', label: 'کاغذ نیم‌سایز A5 (فروشگاهی)' },
                  { id: 'thermal', label: 'فیش حرارتی ۸۰ میلی‌متری (صندوق‌دار)' }
                ].map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => setPrintLayout(layout.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      printLayout === layout.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/10'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-705'
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>

              <button
                onClick={triggerPrintCmd}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فوری فاکتور رسمی</span>
              </button>
            </div>

            {/* Print Layout Preview Box */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-150/40 dark:bg-slate-950/60 flex items-center justify-center">
              
              {/* Thermal receipt format */}
              {printLayout === 'thermal' && (
                <div id="printable-invoice" className="w-80 bg-white text-slate-950 p-4 shadow-xl font-mono border-2 border-dashed border-slate-200 leading-relaxed text-[11px] select-all">
                  <div className="text-center space-y-1">
                    <p className="font-extrabold text-sm font-sans tracking-wide">ملبنا حسابداری فوری</p>
                    <p className="text-[9px] font-sans text-slate-500 font-bold">امور مالی و خدمات حسابداری فوری ملینا</p>
                    <p className="border-b border-dashed my-2 border-slate-300"></p>
                    <p className="text-[10px] text-right">شماره فاکتور: <strong className="font-sans">{selectedInvoice.invoice_number}</strong></p>
                    <p className="text-[10px] text-right">مشتری: <span className="font-bold font-sans">{selectedInvoice.customer_name}</span></p>
                  </div>

                  <table className="w-full text-right mt-3 border-b border-dashed border-slate-300 pb-2">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="font-bold pb-1 text-right">کالا/خدمت</th>
                        <th className="text-center">تعداد</th>
                        <th className="text-left font-bold pb-1">مجموع (ریال)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map(it => (
                        <tr key={it.id}>
                          <td className="pt-1.5 font-bold font-sans line-clamp-1">{it.product_name}</td>
                          <td className="text-center pt-1.5">{it.quantity}</td>
                          <td className="text-left pt-1.5">{formatCurrency(new Decimal(it.unit_price).mul(it.quantity))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 text-xs mt-3 text-right">
                    <p className="flex justify-between"><span>جمع ناخالص کل:</span> <strong>{formatCurrency(selectedInvoice.total_amount)} ریال</strong></p>
                    {selectedInvoice.discount > 0 && <p className="flex justify-between text-red-600"><span>تخفیف:</span> <strong>-{formatCurrency(selectedInvoice.discount)} ریال</strong></p>}
                    <p className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-1.5"><span>مبلغ نهایی تسویه:</span> <strong>{formatCurrency(selectedInvoice.final_amount)} ریال</strong></p>
                  </div>

                  <p className="border-b border-dashed my-3 border-slate-300"></p>
                  <p className="text-center text-[9px] font-sans text-slate-500">با تشکر از خرید شما — مدیریت حسابداری صندوق مالی ملینا</p>
                </div>
              )}

              {/* standard A4 & A5 invoices */}
              {(printLayout === 'a4' || printLayout === 'a5') && invoiceDesign && (
                <CustomDesignedInvoice
                  invoiceDesign={invoiceDesign}
                  printLayout={printLayout as 'a4' | 'a5'}
                  printShopName={printShopName}
                  printShopSlogan={printShopSlogan}
                  printShopAddress={printShopAddress}
                  printShopPhone={printShopPhone}
                  printShopLogo={printShopLogo}
                  invoiceNumber={selectedInvoice.invoice_number}
                  paymentMethod={selectedInvoice.payment_method}
                  selectedCustomer={{
                    id: selectedInvoice.customer_id || 0,
                    first_name: selectedInvoice.customer_name || 'خریدار متفرقه',
                    last_name: '',
                    phone1: selectedInvoice.customer_phone || '---',
                    national_id: '',
                    description: '',
                    status: 'active'
                  }}
                  items={(selectedInvoice.items || []).map(it => ({
                    product: { id: it.product_id, name: it.product_name, code: it.product_code || '---' },
                    quantity: it.quantity,
                    price: it.unit_price ?? it.price ?? 0
                  }))}
                  discount={selectedInvoice.discount || 0}
                  taxRate={0}
                  calculateSubtotal={() => new Decimal(selectedInvoice.total_amount)}
                  calculateTax={() => new Decimal(0)}
                  calculateFinalTotal={() => new Decimal(selectedInvoice.final_amount)}
                  installments={[]}
                  description={selectedInvoice.description || ''}
                  printColCodeLabel="بارکد/کد"
                  printColNameLabel="شرح کالا یا خدمات"
                  printColQtyLabel="تعداد/مقدار"
                  printColPriceLabel="قیمت واحد"
                  printColTotalLabel="جمع کل"
                  printColCurrencyLabel="ریال"
                />
              )}
              {false && (printLayout === 'a4' || printLayout === 'a5') && (
                <div className={`bg-white text-slate-900 shadow-xl p-8 border border-slate-200/50 leading-loose ${
                  printLayout === 'a4' ? 'w-[210mm] min-h-[297mm]' : 'w-[148mm] min-h-[210mm]'
                }`}>
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-lg text-slate-900 tracking-wider">سند صورتحساب فروش کالا و خدمات ملینا</h4>
                      <p className="text-xs text-slate-500 font-medium">پایانه مدیریت حسابداری و مالی ملینا — نسخه آرشیو خریدار</p>
                    </div>
                    <div className="text-left text-xs font-semibold text-slate-600 space-y-1">
                      <p>شماره فاکتور: <span className="font-bold font-mono text-indigo-700">{selectedInvoice.invoice_number}</span></p>
                      <p>روش تسویه: <span className="font-bold">{selectedInvoice.payment_method}</span></p>
                    </div>
                  </div>

                  <div className="my-5 grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 border rounded-xl leading-relaxed space-y-1">
                      <p className="font-bold border-b pb-1 mb-1 text-slate-800">مشخصات فروشنده:</p>
                      <p>فروشگاه: <strong>حسابداری مالی ملینا</strong> — تلفن: ۰۲۱-۵۵۶۶۷۷۸۸</p>
                      <p>نشانی: تهران، بازار بزرگ، سرای ملی، پلاک ۱۲</p>
                    </div>
                    <div className="p-3 border rounded-xl leading-relaxed space-y-1">
                      <p className="font-bold border-b pb-1 mb-1 text-slate-800">مشخصات خریدار تجاری:</p>
                      <p>نام کامل: <strong>{selectedInvoice.customer_name}</strong></p>
                      <p>تلفن تماس: {selectedInvoice.customer_phone || '---'}</p>
                    </div>
                  </div>

                  <table className="w-full text-right text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                        <th className="p-2 border-r">ردیف</th>
                        <th className="p-2 border-r">کد محصول</th>
                        <th className="p-2 border-r">شرح کالا یا خدمات</th>
                        <th className="p-2 border-r text-center w-20">تعداد/مقدار</th>
                        <th className="p-2 border-r text-left w-32">قیمت واحد (ریال)</th>
                        <th className="p-2 text-left w-36">جمع کل ردیف (ریال)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map((it, index) => (
                        <tr key={it.id} className="border-b border-slate-200">
                          <td className="p-2 border-r text-center">{index + 1}</td>
                          <td className="p-2 border-r font-mono">#{it.product_code}</td>
                          <td className="p-2 border-r font-bold">{it.product_name}</td>
                          <td className="p-2 border-r text-center">{it.quantity}</td>
                          <td className="p-2 border-r text-left font-mono">{formatCurrency(it.unit_price)}</td>
                          <td className="p-2 text-left font-mono">{formatCurrency(new Decimal(it.unit_price).mul(it.quantity))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-6 flex justify-between items-start text-xs leading-relaxed">
                    <div className="w-1/2 p-3 border rounded-xl bg-slate-50/50">
                      <p className="font-bold mb-1">توضیحات فاکتور:</p>
                      <p className="text-slate-600">{selectedInvoice.description || 'توضیحاتی بابت خرید ثبت نشده است.'}</p>
                    </div>

                    <div className="w-96 text-xs space-y-2">
                      <p className="flex justify-between"><span>جمع خالص اقلام فاکتور:</span> <strong className="font-mono">{formatCurrency(selectedInvoice.total_amount)} ریال</strong></p>
                      {selectedInvoice.discount > 0 && <p className="flex justify-between text-red-600"><span>تخفیف اعطایی:</span> <strong className="font-mono">-{formatCurrency(selectedInvoice.discount)} ریال</strong></p>}
                      <p className="flex justify-between font-extrabold text-sm border-t-2 border-slate-900 pt-2 text-slate-900"><span>جمع نهایی کل رسید:</span> <strong className="font-mono text-indigo-700">{formatCurrency(selectedInvoice.final_amount)} ریال</strong></p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
