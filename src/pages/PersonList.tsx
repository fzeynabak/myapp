import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  Search, 
  User, 
  Building2, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  Plus, 
  X, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  HelpCircle,
  Hash,
  Activity,
  UserCheck,
  Check,
  UserCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Person } from '../types';
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

export default function PersonList() {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('همه');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Person>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    if (window.electronAPI?.getPersons) {
      try {
        const data = await window.electronAPI.getPersons();
        setPersons(data || []);
      } catch (e: any) {
        console.error('Error fetching persons:', e);
        MySwal.fire('خطا', 'خطا در بارگذاری اطلاعات از پایگاه داده', 'error');
      }
    } else {
      // Stub for preview / development environment
      setPersons([
        {
          id: 1,
          accounting_code: '1000-ACC',
          first_name: 'امیر',
          last_name: 'اکرمی',
          title: '',
          nickname: 'آکرمی',
          type: 'حقیقی',
          category: 'مشتری',
          national_id: '0012345678',
          phone1: '09121111111',
          city: 'تهران',
          address: 'خیابان ولیعصر، کوچه نصر، پلاک ۱۰',
          credit_limit: 50000000,
          bank_name: 'بانک ملی',
          bank_account: '1234567890',
          iban: '123456789012345678901234',
          tax_registered: 1,
          is_shareholder: 1,
          is_employee: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          accounting_code: '1001-ACC',
          first_name: '',
          last_name: '',
          title: 'شرکت فناوری نوین رایان',
          nickname: 'رایان تک',
          type: 'حقوقی',
          category: 'تامین‌کننده',
          national_id: '10100234567',
          economic_code: '411122233344',
          registration_number: '54321',
          phone1: '02188888888',
          city: 'اصفهان',
          address: 'خیابان ونک، برج نگار، طبقه ۵',
          credit_limit: 200000000,
          bank_name: 'بانک سامان',
          bank_account: '9876543210',
          iban: '987654321098765432109876',
          tax_registered: 0,
          is_shareholder: 0,
          is_employee: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          accounting_code: '1002-ACC',
          first_name: 'سهراب',
          last_name: 'سپهری',
          title: '',
          nickname: 'سهراب',
          type: 'حقیقی',
          category: 'سایر',
          national_id: '1234567890',
          phone1: '09123334455',
          city: 'کاشان',
          address: 'محله گلستان، کوچه شاعر، پلاک ۵',
          credit_limit: 0,
          bank_name: 'بانک ملت',
          tax_registered: 0,
          is_shareholder: 1,
          is_employee: 1,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const getPersonRoles = (p: Person) => {
    const roles: string[] = [];
    if (p.is_shareholder === 1) roles.push('سهامدار');
    if (p.is_employee === 1) roles.push('کارمند');
    if (p.category === 'مشتری') roles.push('مشتری');
    if (p.category === 'تامین‌کننده') roles.push('تامین‌کننده');
    if (p.category === 'فروشنده') roles.push('فروشنده');
    return roles;
  };

  const handleEditClick = (person: Person) => {
    // Reconstruct roles array
    const roles = getPersonRoles(person);
    setEditForm({ 
      ...person,
      roles 
    });
    setIsEditModalOpen(true);
  };

  const handleDetailClick = (person: Person) => {
    setSelectedPerson(person);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'آیا مطمئن هستید؟',
      text: 'این شخص و تمام وابستگی‌های آن (پوشه پرونده، داده‌های سهام و استخدام) برای همیشه حذف خواهند شد.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف'
    });

    if (result.isConfirmed) {
      if (window.electronAPI?.deletePerson) {
        try {
          const res = await window.electronAPI.deletePerson(id);
          if (res.success) {
            MySwal.fire({
              title: 'حذف شد!',
              text: 'شخص با موفقیت از سیستم حذف گردید.',
              icon: 'success',
              confirmButtonColor: '#4f46e5'
            });
            fetchPersons();
          }
        } catch (e: any) {
          MySwal.fire('خطا', e.message || 'خطا در حذف رکورد از دیتابیس', 'error');
        }
      } else {
        setPersons(prev => prev.filter(p => p.id !== id));
        MySwal.fire('محیط وب', 'رکورد به صورت فرضی در محیط پیش‌نمایش حذف شد.', 'success');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.type === 'حقیقی' && !editForm.first_name && !editForm.last_name) {
      MySwal.fire('خطا', 'نام و نام خانوادگی برای شخص حقیقی الزامی است.', 'warning');
      return;
    }
    if (editForm.type === 'حقوقی' && !editForm.title) {
      MySwal.fire('خطا', 'نام شرکت الزامی است.', 'warning');
      return;
    }

    setIsLoading(true);
    if (window.electronAPI?.updatePerson) {
      try {
        const res = await window.electronAPI.updatePerson(editForm);
        if (res.success) {
          MySwal.fire({
            icon: 'success',
            title: 'بروزرسانی موفق',
            text: 'اطلاعات شخص با موفقیت در دایتکث ذخیره شد.',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
          setIsEditModalOpen(false);
          fetchPersons();
        }
      } catch (e: any) {
        MySwal.fire('خطا', e.message || 'مشکل در ذخیره‌سازی داده‌ها', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      setPersons(prev => prev.map(p => {
        if (p.id === editForm.id) {
          const finalRoles = editForm.roles || [];
          return { 
            ...p, 
            ...editForm,
            is_shareholder: finalRoles.includes('سهامدار') ? 1 : 0,
            is_employee: finalRoles.includes('کارمند') ? 1 : 0
          } as Person;
        }
        return p;
      }));
      MySwal.fire('محیط وب', 'اطلاعات به صورت موقت در محیط پیش‌نمایش ذخیره شد.', 'success');
      setIsEditModalOpen(false);
      setIsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEditForm(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleEditRoleToggle = (role: string) => {
    setEditForm(prev => {
      const currentRoles = prev.roles || [];
      const updatedRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      
      // Keep category synced if they toggle client/supplier role
      let category = prev.category || 'سایر';
      if (role === 'مشتری' && updatedRoles.includes('مشتری')) {
        category = 'مشتری';
      } else if (role === 'تامین‌کننده' && updatedRoles.includes('تامین‌کننده')) {
        category = 'تامین‌کننده';
      } else if (role === 'فروشنده' && updatedRoles.includes('فروشنده')) {
        category = 'فروشنده';
      }

      return {
        ...prev,
        roles: updatedRoles,
        category
      };
    });
  };

  const getFullName = (p: Partial<Person>) => {
    if (p.type === 'حقوقی') return p.title || 'شرکت بدون عنوان';
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'نامشخص';
  };

  // Modern design cards helper
  const getCardTheme = (p: Person) => {
    // Theme prioritisation
    if (p.is_shareholder === 1) {
      return {
        accentBorder: 'border-t-[6px] border-t-emerald-500 border-x border-b border-light dark:border-slate-800/80',
        bg: 'bg-white dark:bg-slate-900',
        shadow: 'hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
        iconBg: 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
        label: 'سهامدار شرکت'
      };
    }
    if (p.is_employee === 1) {
      return {
        accentBorder: 'border-t-[6px] border-t-sky-500 border-x border-b border-light dark:border-slate-800/80',
        bg: 'bg-white dark:bg-slate-900',
        shadow: 'hover:shadow-sky-500/10 dark:hover:shadow-sky-500/5',
        textAccent: 'text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
        iconBg: 'bg-sky-100/50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
        label: 'کارمند رسمی'
      };
    }
    if (p.category === 'مشتری') {
      return {
        accentBorder: 'border-t-[6px] border-t-amber-500 border-x border-b border-light dark:border-slate-800/80',
        bg: 'bg-white dark:bg-slate-900',
        shadow: 'hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5',
        textAccent: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
        iconBg: 'bg-amber-100/50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
        label: 'مشتری تجاری'
      };
    }
    if (p.category === 'تامین‌کننده') {
      return {
        accentBorder: 'border-t-[6px] border-t-purple-500 border-x border-b border-light dark:border-slate-800/80',
        bg: 'bg-white dark:bg-slate-900',
        shadow: 'hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5',
        textAccent: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
        iconBg: 'bg-purple-100/50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
        label: 'تامین‌کننده کالا'
      };
    }
    return {
      accentBorder: 'border-t-[6px] border-t-slate-400 border-x border-b border-light dark:border-slate-800/80',
      bg: 'bg-white dark:bg-slate-900',
      shadow: 'hover:shadow-slate-500/10 dark:hover:shadow-slate-500/5',
      textAccent: 'text-slate-600 dark:text-slate-400',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
      iconBg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      label: 'عضو عمومی'
    };
  };

  // Filter and search
  const filteredPersons = persons.filter(p => {
    const term = searchQuery.toLowerCase().trim();
    const fullName = getFullName(p).toLowerCase();
    const phone = (p.phone1 || '').toLowerCase();
    const code = (p.accounting_code || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const natId = (p.national_id || '').toLowerCase();

    const matchesSearch = 
      fullName.includes(term) || 
      phone.includes(term) || 
      code.includes(term) || 
      city.includes(term) || 
      natId.includes(term);

    if (activeTab === 'همه') return matchesSearch;
    if (activeTab === 'سهامدار') return matchesSearch && p.is_shareholder === 1;
    if (activeTab === 'کارمند') return matchesSearch && p.is_employee === 1;
    if (activeTab === 'مشتری') return matchesSearch && p.category === 'مشتری';
    if (activeTab === 'تامین‌کننده') return matchesSearch && p.category === 'تامین‌کننده';
    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-20 overflow-y-auto custom-scrollbar pr-1" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/10 dark:bg-transparent py-4 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">لیست تفکیکی اشخاص</h2>
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
            مشاهده کارت‌های مشخصات شرکا، کارمندان و نهادهای مالی مرتبط با سیستم به همراه فیلترهای پیشرفته
          </p>
        </div>
        <button 
          onClick={() => navigate('/persons/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          ثبت شخص الکترونیکی جدید
        </button>
      </div>

      {/* Advanced Filter Segment Control */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 p-1.5 rounded-3xl border border-slate-200/45 dark:border-slate-800/40 flex flex-wrap gap-1 items-center">
        {[
          { key: 'همه', label: 'همه اشخاص', count: persons.length },
          { key: 'مشتری', label: 'مشتریان', count: persons.filter(p => p.category === 'مشتری').length },
          { key: 'تامین‌کننده', label: 'تامین‌کنندگان', count: persons.filter(p => p.category === 'تامین‌کننده').length },
          { key: 'سهامدار', label: 'سهام‌داران', count: persons.filter(p => p.is_shareholder === 1).length },
          { key: 'کارمند', label: 'کارمندان', count: persons.filter(p => p.is_employee === 1).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative",
              activeTab === tab.key 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-slate-200/50 dark:shadow-none"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all",
              activeTab === tab.key 
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-200/60 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>      {/* Control Panel / Search */}
      <div className="bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/30 flex items-center justify-between">
        <div className="relative w-full">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="جستجوی همزمان بر اساس نام، فامیل، کدملی، شماره تلفن همراه، نام شرکت یا کد تفصیلی حساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-5 pr-12 py-3 bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm font-semibold transition-all text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Cards Grid Layout */}
      {filteredPersons.length === 0 ? (
        <div className="bg-white/40 dark:bg-slate-900/10 rounded-3xl p-16 border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-md font-bold text-slate-700 dark:text-slate-350">هیچ شخص منطبقی پیدا نشد</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            هیچ کارتی با معیار کلمه‌ی کلیدی "{searchQuery || 'بدون فیلتر'}" در تب "{activeTab === 'همه' ? 'همه اشخاص' : activeTab}" وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
          {filteredPersons.map(person => {
            const theme = getCardTheme(person);
            const rolesList = getPersonRoles(person);
            return (
              <div 
                key={person.id}
                className={cn(
                  "rounded-2xl p-4 transition-all duration-300 shadow-sm relative group flex flex-col justify-between overflow-hidden",
                  theme.accentBorder,
                  theme.bg,
                  theme.shadow,
                  "hover:-translate-y-0.5 border border-slate-150 dark:border-slate-800/80"
                )}
              >
                {/* Accent Highlight Glow */}
                <div className="absolute -left-10 -top-10 w-20 h-20 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all pointer-events-none"></div>
                
                {/* Upper Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-400 dark:text-slate-500">
                      ID: {person.id}
                    </span>
                    <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg shadow-inner", theme.badgeBg)}>
                      {theme.label}
                    </span>
                  </div>

                  {/* Contact Avatar & Header details */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={cn("w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 shrink-0", theme.iconBg)}>
                      {person.avatar ? (
                        <img src={person.avatar} alt={getFullName(person)} className="w-full h-full object-cover" />
                      ) : person.type === 'حقیقی' ? (
                        <User className="w-5 h-5 shrink-0" />
                      ) : (
                        <Building2 className="w-5 h-5 shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug truncate">
                        {getFullName(person)}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold truncate">
                        {person.nickname ? `(${person.nickname})` : person.type}
                      </p>
                    </div>
                  </div>

                  {/* Separation line */}
                  <div className="border-t border-slate-100 dark:border-slate-800/30 my-2.5"></div>

                  {/* Body elements / Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                    {/* Accounting key */}
                    <div className="flex justify-between items-center bg-slate-100/40 dark:bg-slate-950/20 p-1.5 rounded-lg border border-slate-200/20 dark:border-slate-800/25">
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[11px]">
                        <Hash className="w-3 h-3" />
                        کد کل حسابداری:
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {person.accounting_code}
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        شماره تماس:
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {person.phone1 || 'ثبت نشده'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        موقعیت جغرافیایی:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                        {person.city ? `${person.city}` : 'بدون آدرس'}
                      </span>
                    </div>

                    {/* Tax configuration */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 dark:text-slate-500">ارزش افزوده:</span>
                      {person.tax_registered ? (
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-extrabold font-sans">
                          <CheckCircle className="w-3 h-3" />
                          مشمول مالیاتی
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 font-semibold">نامشمول</span>
                      )}
                    </div>

                    {/* Financial block if set */}
                    {person.credit_limit && person.credit_limit > 0 ? (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          سقف اعتبار:
                        </span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-500">
                          {Number(person.credit_limit).toLocaleString('fa-IR')} ریال
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer Roles & Action toolbar */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40 flex flex-col gap-2">
                  {/* Dynamic Roles inside card footer */}
                  {rolesList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rolesList.map(r => (
                        <span 
                          key={r}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Button interactions toolbar */}
                  <div className="flex items-center justify-between gap-1">
                    <button 
                      onClick={() => handleDetailClick(person)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      رویت پرونده
                    </button>
                    
                    <button 
                      onClick={() => handleEditClick(person)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 dark:text-emerald-400 p-2 rounded-xl transition-all cursor-pointer"
                      title="ویرایش اطلاعات شخص"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => handleDelete(person.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 p-2 rounded-xl transition-all cursor-pointer animate-none"
                      title="حذف و ابطال پرونده"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Details Drawer / modal --- */}
      {isDetailModalOpen && selectedPerson && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-100 dark:border-slate-800 p-8 relative">
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl bg-slate-100 dark:bg-slate-800 shrink-0",
                !selectedPerson.avatar && (selectedPerson.is_shareholder === 1 ? "bg-emerald-500 text-white" : selectedPerson.is_employee === 1 ? "bg-sky-500 text-white" : "bg-indigo-500 text-white")
              )}>
                {selectedPerson.avatar ? (
                  <img src={selectedPerson.avatar} alt={getFullName(selectedPerson)} className="w-full h-full object-cover" />
                ) : selectedPerson.type === 'حقیقی' ? (
                  <User className="w-7 h-7" />
                ) : (
                  <Building2 className="w-7 h-7" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{getFullName(selectedPerson)}</h3>
                <p className="text-xs text-indigo-500 font-mono mt-0.5">کد حسابداری کل: {selectedPerson.accounting_code}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Contact */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  اطلاعات تماس
                </h4>
                <div>
                  <span className="text-[10px] text-slate-400">تلفن همراه :</span>
                  <p className="font-bold text-slate-750 dark:text-slate-300 font-mono dir-ltr text-right mt-1">{selectedPerson.phone1 || 'تنظیم نشده'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">تلفن همراه دوم :</span>
                  <p className="font-bold text-slate-750 dark:text-slate-300 font-mono dir-ltr text-right mt-1">{selectedPerson.phone2 || 'تنظیم نشده'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">پست الکترونیکی :</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{selectedPerson.email || 'تنظیم نشده'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">وب‌سایت :</span>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{selectedPerson.website || 'تنظیم نشده'}</p>
                </div>
              </div>

              {/* Box 2: Codes */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  شناسه‌ها و کدهای ملی
                </h4>
                <div>
                  <span className="text-[10px] text-slate-400">شناسه یا کد ملی :</span>
                  <p className="font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.national_id || 'تنظیم نشده'}</p>
                </div>
                {selectedPerson.type === 'حقوقی' && (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-400">کد اقتصادی :</span>
                      <p className="font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.economic_code || 'تنظیم نشده'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">شماره ثبت :</span>
                      <p className="font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.registration_number || 'تنظیم نشده'}</p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[10px] text-slate-400">وضعیت گواهی ارزش افزوده :</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedPerson.tax_registered ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                        <CheckCircle className="w-3.5 h-3.5" />
                        مشمول مالیات بر ارزش افزوده
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-805 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        غیرمشمول / عادی
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 3: Address */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:col-span-2 space-y-3">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  آدرس و اطلاعات مکانی
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400">شهر / استان :</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300 mt-1">{selectedPerson.city || 'تنظیم نشده'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">کد پستی :</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.postal_code || 'تنظیم نشده'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">آدرس پستی تفصیلی :</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedPerson.address || 'هیچ نشانی پستی مکتوب فرار داده نشده است.'}</p>
                </div>
              </div>

              {/* Box 4: Financial Info */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:col-span-2 space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  اطلاعات حساب و اعتبارات بانکی
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400">بانک عامل :</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300 mt-1">{selectedPerson.bank_name || 'تنظیم نشده'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">شماره حساب :</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.bank_account || 'تنظیم نشده'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">شماره کارت عابربانک :</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300 font-mono mt-1">{selectedPerson.bank_card || 'تنظیم نشده'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">شماره بین‌المللی شبا (IBAN) :</span>
                  <p className="text-xs font-extrabold text-slate-750 dark:text-slate-300 font-mono tracking-widest mt-1 text-left dir-ltr">
                    {selectedPerson.iban ? `IR-${selectedPerson.iban}` : 'تنظیم نشده'}
                  </p>
                </div>
              </div>
            </div>

            {selectedPerson.description && (
              <div className="mt-6 p-5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 rounded-3xl">
                <span className="text-xs text-amber-600 font-bold block mb-1">توضیحات و یادداشت انبارداری :</span>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{selectedPerson.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Inline Editing Dialog --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-100 dark:border-slate-800 p-8 relative">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-b border-slate-150 dark:border-slate-800 flex items-center gap-2">
              <Edit className="w-6 h-6 text-indigo-500" />
              ویرایش اطلاعات {getFullName(editForm)}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-8 text-right">
              {/* Type selection and roles section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-100/40 dark:bg-slate-800/30 p-6 rounded-3xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3">نوع حقوقی شخص</h4>
                  <div className="flex bg-slate-200/50 dark:bg-slate-950/50 p-1 rounded-2xl w-full">
                    <button 
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, type: 'حقیقی' }))}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", editForm.type === 'حقیقی' ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500")}
                    >
                      شخص حقیقی
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, type: 'حقوقی' }))}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", editForm.type === 'حقوقی' ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500")}
                    >
                      سازمان / حقوقی
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3">نقش‌ها و رده‌های انتسابی</h4>
                  <div className="flex flex-wrap gap-2">
                    {['سهامدار', 'کارمند', 'مشتری', 'تامین‌کننده', 'فروشنده'].map(role => {
                      const isActive = (editForm.roles || []).includes(role);
                      return (
                        <button 
                          key={role}
                          type="button"
                          onClick={() => handleEditRoleToggle(role)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                            isActive 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800 dark:text-slate-400"
                          )}
                        >
                          {isActive && <Check className="w-3.5 h-3.5" />}
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Base Info Fields */}
              <div className="bg-slate-50/50 dark:bg-slate-950/10 p-6 rounded-2xl">
                {/* Profile Photo Upload Field in Edit Modal */}
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 pb-6 border-b border-slate-200/55 dark:border-slate-800/60 justify-start">
                  <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-slate-350 dark:border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-inner shrink-0">
                    {editForm.avatar ? (
                      <>
                        <img src={editForm.avatar} alt="Avatar Edit" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-semibold text-center leading-tight">
                          تغییر تصویر
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <UserCircle2 className="w-6 h-6 mb-0.5" />
                        <span className="text-[8px] font-semibold">انتخاب تصویر</span>
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
                              setEditForm(prev => ({
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
                  {editForm.avatar && (
                    <button 
                      type="button" 
                      onClick={() => setEditForm(prev => ({ ...prev, avatar: '' }))}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                    >
                      حذف تصویر فعلی
                    </button>
                  )}
                  <div className="text-right sm:mr-3">
                    <h4 className="text-xs font-black text-slate-750 dark:text-slate-200">تصویر شناسایی یا آواتار</h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">تصویری با حجم کمتر از دو مگابایت قرار دهید.</p>
                  </div>
                </div>

                {editForm.type === 'حقیقی' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-250">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">نام</label>
                      <input type="text" name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">نام خانوادگی</label>
                      <input type="text" name="last_name" value={editForm.last_name || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">کد ملی</label>
                      <input type="text" name="national_id" value={editForm.national_id || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm font-mono dir-ltr text-right" placeholder="----------" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">نام مستعار یا برند</label>
                      <input type="text" name="nickname" value={editForm.nickname || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-250">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">نام شرکت یا سازمان (عنوان به کار رفته)</label>
                      <input type="text" name="title" value={editForm.title || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-850 dark:text-slate-100 text-sm font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">شناسه یا سریال ملی</label>
                      <input type="text" name="national_id" value={editForm.national_id || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm font-mono dir-ltr text-right" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">کد اقتصادی دوازده رقمی</label>
                      <input type="text" name="economic_code" value={editForm.economic_code || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm font-mono dir-ltr text-right" />
                    </div>
                  </div>
                )}
              </div>

              {/* Box contact and location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 mb-1 border-b pb-2 dark:border-slate-800">اطلاعات ارتباطی و ایمیل</h4>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">شماره تلفن همراه (اصلی)</label>
                    <input type="text" name="phone1" value={editForm.phone1 || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">شماره تلفن ثابت دوم</label>
                    <input type="text" name="phone2" value={editForm.phone2 || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">آدرس ایمیل ارتباطی</label>
                    <input type="email" name="email" value={editForm.email || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm focus:border-indigo-500" placeholder="e.g. name@mail.com" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 mb-1 border-b pb-2 dark:border-slate-800">آدرس و محل سکونت</h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">منطقه / شهر / استان</label>
                      <input type="text" name="city" value={editForm.city || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-100 text-sm" />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-xs text-slate-500 mb-1">کد پستی ۱۰ رقمی</label>
                      <input type="text" name="postal_code" value={editForm.postal_code || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" placeholder="xxxxxxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">آدرس دقیق پستی</label>
                    <textarea name="address" value={editForm.address || ''} onChange={handleEditChange} rows={3} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-100 resize-none text-xs leading-relaxed" />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-slate-50 dark:bg-slate-850/20 p-6 rounded-3xl space-y-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 pb-2 border-b border-slate-150 dark:border-slate-800">مشخصات اعتباری، بانکی و مالیاتی</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">بانک عامل</label>
                    <input type="text" name="bank_name" value={editForm.bank_name || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">شماره حساب بانکی</label>
                    <input type="text" name="bank_account" value={editForm.bank_account || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">شماره کارت عابر بانک</label>
                    <input type="text" name="bank_card" value={editForm.bank_card || ''} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">شماره بین‌المللی شبا (IBAN)</label>
                    <div className="relative flex">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">IR</span>
                      <input type="text" name="iban" value={editForm.iban || ''} onChange={handleEditChange} className="w-full pl-12 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-left dark:text-slate-100 text-sm" placeholder="0000 0000 0000 0000 0000 0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">سقف اعتبار تجاری (ریال)</label>
                    <input type="number" name="credit_limit" value={editForm.credit_limit || 0} onChange={handleEditChange} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right dark:text-slate-100 text-sm" />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" name="tax_registered" checked={!!editForm.tax_registered} onChange={(e) => setEditForm(prev => ({ ...prev, tax_registered: e.target.checked ? 1 : 0 }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">مشمول ثبت‌نام در نظام ارزش افزوده</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Text Description in Edit Form */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">یادداشت اداری / توضیحات تکمیلی پرونده</label>
                <textarea name="description" value={editForm.description || ''} onChange={handleEditChange} rows={3} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-100 resize-none text-xs leading-relaxed" />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-110 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                >
                  انصراف و لغو
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  اعمال و ذخیره‌سازی تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
