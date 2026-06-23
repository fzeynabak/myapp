import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Save, User, MapPin, Phone, CreditCard, FileText, Briefcase, Building2, UserCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const MySwal = withReactContent(Swal);

export default function PersonNew() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Forms State
  const [formData, setFormData] = useState({
    auto_accounting_code: true,
    accounting_code: '',
    first_name: '',
    last_name: '',
    title: '', // for حقوقی
    nickname: '',
    type: 'حقیقی', // حقیقی or حقوقی
    category: 'مشتری',
    roles: [] as string[],
    birth_date: '',
    membership_date: '',
    marriage_date: '',

    // Address
    country: 'ایران',
    city: '',
    address: '',
    postal_code: '',

    // Contact
    phone1: '',
    phone2: '',
    phone3: '',
    fax: '',
    email: '',
    website: '',

    // Bank
    bank_account: '',
    bank_card: '',
    bank_name: '',
    iban: '',

    // Other
    economic_code: '',
    registration_number: '',
    personal_code: '',
    credit_limit: 0,
    national_id: '',
    description: '',
    tax_registered: false,
    avatar: ''
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSave = async () => {
    if (!window.electronAPI?.addPerson) {
      MySwal.fire('خطا', 'این قابلیت فقط در محیط دسکتاپ فعال است.', 'warning');
      return;
    }

    if (formData.type === 'حقیقی' && !formData.first_name && !formData.last_name) {
      MySwal.fire('نقص اطلاعات', 'وارد کردن نام و نام خانوادگی برای شخص حقیقی الزامی است.', 'warning');
      return;
    }
    if (formData.type === 'حقوقی' && !formData.title) {
      MySwal.fire('نقص اطلاعات', 'وارد کردن نام شرکت (عنوان) الزامی است.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await window.electronAPI.addPerson(formData);
      if (res.success) {
        MySwal.fire({
          icon: 'success',
          title: 'شخص با موفقیت ثبت شد!',
          text: `شخص جدید با کد حسابداری ${res.accounting_code} ثبت شد.`,
          confirmButtonColor: '#4f46e5'
        });
        // reset form if needed
        setFormData(prev => ({ ...prev, first_name: '', last_name: '', title: '', avatar: '' }));
      }
    } catch(e: any) {
      MySwal.fire('خطا', e.message || 'مشکل در ذخیره اطلاعات در دیتابیس', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-20 overflow-y-auto custom-scrollbar pr-2">
      <div className="flex justify-between items-center sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-10 py-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <UserCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">افزودن شخص جدید</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">ثبت اطلاعات مشتریان، تامین‌کنندگان و همکاران</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-75 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          ذخیره اطلاعات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Left Column (Logically Right via RTL) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* تصویر پرسنلی */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/50 dark:border-slate-800/50 flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2 w-full self-start">
              <UserCircle2 className="w-4 h-4 text-indigo-500" />
              تصویر شخص
            </h3>
            
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              {formData.avatar ? (
                <>
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                    تغییر تصویر
                  </div>
                </>
              ) : (
                <div className="text-center p-2 flex flex-col items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-0.5" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">انتخاب تصویر</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      MySwal.fire('خطای حجم فایل', 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد.', 'warning');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setFormData(prev => ({
                          ...prev,
                          avatar: event.target!.result as string
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
            </div>
            {formData.avatar && (
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                className="text-[10px] text-rose-500 hover:text-rose-600 mt-2 font-semibold transition-colors cursor-pointer"
              >
                حذف تصویر
              </button>
            )}
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50 dark:border-slate-800/50 relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
             
             <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
               <Briefcase className="w-4 h-4" />
               شناسه سیستم
             </h3>

             <div className="space-y-4 relative z-10">
                <label className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">کد حسابداری خودکار</span>
                  <div className="relative">
                    <input type="checkbox" name="auto_accounting_code" checked={formData.auto_accounting_code} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                {!formData.auto_accounting_code && (
                  <div className="animate-in slide-in-from-top-2">
                    <input type="text" name="accounting_code" value={formData.accounting_code} onChange={handleChange} placeholder="کد اختصاصی..." className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-slate-200 font-mono" dir="ltr" />
                  </div>
                )}
             </div>

             <div className="mt-8">
               <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                 <User className="w-4 h-4" />
                 نوع شخص
               </h3>
               <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                 <button 
                   onClick={() => setFormData(prev => ({...prev, type: 'حقیقی'}))}
                   className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all", formData.type === 'حقیقی' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
                 >
                   شخص حقیقی
                 </button>
                 <button 
                   onClick={() => setFormData(prev => ({...prev, type: 'حقوقی'}))}
                   className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all", formData.type === 'حقوقی' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400")}
                 >
                   شرکت (حقوقی)
                 </button>
               </div>
             </div>

             <div className="mt-8">
               <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider">نقش‌ها تخصیص یافته</h3>
               <div className="flex flex-wrap gap-2">
                 {['سهامدار', 'کارمند', 'تامین‌کننده', 'مشتری', 'فروشنده'].map(role => (
                   <button 
                     key={role}
                     onClick={() => handleRoleToggle(role)}
                     className={cn(
                       "px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none",
                       formData.roles.includes(role) 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50"
                     )}
                   >
                     {role}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* Main Content / Right Column (Logically Left via RTL) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 dark:border-slate-800/50 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
              {formData.type === 'حقیقی' ? <User className="w-5 h-5 text-indigo-500" /> : <Building2 className="w-5 h-5 text-indigo-500" />}
              اطلاعات پایه
            </h3>

            {formData.type === 'حقیقی' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نام</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none  dark:text-slate-200 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نام خانوادگی</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none  dark:text-slate-200 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">کد ملی</label>
                  <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all font-mono" placeholder="----------" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نام مستعار</label>
                  <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none  dark:text-slate-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">تاریخ تولد</label>
                  <input type="text" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all" placeholder="مثال: ۱۳۷۰/۰۵/۱۲" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شناسه پرسنلی / عضویت</label>
                  <input type="text" name="personal_code" value={formData.personal_code} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all font-mono" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نام شرکت / سازمان</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none  dark:text-slate-200 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شناسه ملی</label>
                  <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">کد اقتصادی</label>
                  <input type="text" name="economic_code" value={formData.economic_code} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شماره ثبت</label>
                  <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">تاریخ تاسیس / آغاز همکاری</label>
                  <input type="text" name="membership_date" value={formData.membership_date} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-all" placeholder="مثال: ۱۳۸۰/۰۱/۰۱" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 dark:border-slate-800/50 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-500" />
                اطلاعات تماس
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">تلفن همراه</label>
                  <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-colors" placeholder="09xxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">تلفن ثابت</label>
                  <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-colors" placeholder="021xxxxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ایمیل</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-colors" placeholder="example@mail.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">آدرس وب‌سایت</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-colors" placeholder="https://" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 dark:border-slate-800/50 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500" />
                موقعیت جغرافیایی
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">استان / شهر</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dark:text-slate-200 transition-colors" />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">کد پستی</label>
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-4 py-2 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none dir-ltr text-right dark:text-slate-200 transition-colors font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">آدرس دقیق</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:text-slate-200 transition-colors resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 dark:border-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              اطلاعات مالی و بانکی
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نام بانک</label>
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شماره شبا (IBAN)</label>
                <div className="flex relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 rounded">IR</span>
                   <input type="text" name="iban" value={formData.iban} onChange={handleChange} className="w-full pl-16 pr-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-left font-mono tracking-widest dark:text-slate-200 transition-all" placeholder="0000 0000 0000 0000 0000 0000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شماره کارت</label>
                <input type="text" name="bank_card" value={formData.bank_card} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right font-mono dark:text-slate-200 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">شماره حساب</label>
                <input type="text" name="bank_account" value={formData.bank_account} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right font-mono dark:text-slate-200 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">سقف اعتبار (ریال)</label>
                <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-right font-mono dark:text-slate-200 transition-all" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="tax_registered" checked={formData.tax_registered} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </div>
                <div>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">مشمول ثبت‌نام نظام مالیاتی</span>
                   <span className="text-xs text-slate-500">آیا این شخص / شرکت ارزش افزوده محاسبه می‌شود؟</span>
                </div>
              </label>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
