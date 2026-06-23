import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  Users, 
  Lock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  CheckSquare, 
  Square,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SystemUser, Person } from '../types';

const MySwal = withReactContent(Swal);

interface PagePermission {
  key: string;
  title: string;
}

const SYSTEM_PAGES: PagePermission[] = [
  { key: 'dashboard', title: 'داشبورد مالی و فروش' },
  { key: 'persons', title: 'کاربران و اشخاص (ثبت، ویرایش و حذف)' },
  { key: 'sellers', title: 'مدیریت و پورسانت فروشندگان' },
  { key: 'shareholders', title: 'سود و تراز شرکا و سهامداران' },
  { key: 'products', title: 'کالاها، خدمات و دسته‌بندی‌ها' },
  { key: 'sales', title: 'فروش سریع و صدور فاکتور رسمی' },
  { key: 'inventory', title: 'انبارداری و تاریخچه کاردکس' },
  { key: 'settings', title: 'تنظیمات پایه و لاگ‌های سیستمی' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [activeUser, setActiveUser] = useState<SystemUser | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forms states
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    role: 'کاربر' as any,
    person_id: '',
    allowedPages: ['dashboard'] as string[],
  });

  const [editForm, setEditForm] = useState<Partial<SystemUser & { allowedPages: string[] }>>({});

  useEffect(() => {
    fetchUsers();
    // Fetch current user from session if stored
    const sess = sessionStorage.getItem('current_user');
    if (sess) {
      setActiveUser(JSON.parse(sess));
    }
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI?.getSystemUsers) {
        const uList = await window.electronAPI.getSystemUsers();
        setUsers(uList || []);
      }
      if (window.electronAPI?.getPersons) {
        const pList = await window.electronAPI.getPersons();
        setPersons(pList || []);
      }
    } catch (e: any) {
      console.error('Error fetching system users:', e);
      MySwal.fire('خطا', 'عدم امکان واکشی لیست کاربران.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.username || !addForm.password) {
      MySwal.fire('بررسی ورودی', 'نام کاربری و کلمه عبور اجباری هستند.', 'warning');
      return;
    }

    if (users.some(u => u.username.trim().toLowerCase() === addForm.username.trim().toLowerCase())) {
      MySwal.fire('خطای همپوشانی', 'نام کاربری وارد شده تکراری است.', 'warning');
      return;
    }

    // Permissions logic
    const permissions = addForm.role === 'مدیر' ? '*' : addForm.allowedPages.join(',');

    try {
      setIsLoading(true);
      const res = await window.electronAPI?.saveUserAccount({
        username: addForm.username.trim(),
        password: addForm.password,
        role: addForm.role,
        person_id: addForm.person_id ? Number(addForm.person_id) : null,
        permissions: permissions
      });

      if (res?.success) {
        MySwal.fire({
          icon: 'success',
          title: 'کاربر با موفقیت ثبت شد',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        setIsAddOpen(false);
        setAddForm({
          username: '',
          password: '',
          role: 'کاربر',
          person_id: '',
          allowedPages: ['dashboard'],
        });
        fetchUsers();
      }
    } catch (err: any) {
      MySwal.fire('خطا', err.message || 'مشکلی رخ داد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.username || !editForm.password) {
      MySwal.fire('ورودی نامعتبر', 'نام کاربری و کلمه عبور نمی‌توانند خالی باشند.', 'warning');
      return;
    }

    const sameName = users.find(u => u.username.trim().toLowerCase() === editForm.username?.trim().toLowerCase());
    if (sameName && sameName.id !== editForm.id) {
      MySwal.fire('کپی نام مجاز نیست', 'این نام کاربری مربوط به کاربر دیگری است.', 'warning');
      return;
    }

    const permissions = editForm.role === 'مدیر' ? '*' : (editForm.allowedPages || []).join(',');

    try {
      setIsLoading(true);
      const res = await window.electronAPI?.saveUserAccount({
        id: editForm.id,
        username: editForm.username.trim(),
        password: editForm.password,
        role: editForm.role,
        person_id: editForm.person_id ? Number(editForm.person_id) : null,
        permissions: permissions
      });

      if (res?.success) {
        MySwal.fire({
          icon: 'success',
          title: 'تغییرات با موفقیت ذخیره شد.',
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false
        });
        setIsEditOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      MySwal.fire('خطای دیتابیس', err.message || 'اعمال تغییرات با خطا مواجه شد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    // Prevent delete self
    if (activeUser && activeUser.id === id) {
      MySwal.fire('غیر مجاز', 'امکان حذف حساب کاربری جاری وجود ندارد.', 'warning');
      return;
    }

    const confirm = await MySwal.fire({
      title: `حذف حساب کاربری "${username}"؟`,
      text: 'با حذف این حساب، شخص مورد نظر دیگر قادر به ورود به پنل نخواهد بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        setIsLoading(true);
        const res = await window.electronAPI?.deleteUserAccount(id);
        if (res?.success) {
          MySwal.fire('حذف شد', 'حساب کاربری با موفقیت حذف شد.', 'success');
          fetchUsers();
        }
      } catch (e: any) {
        MySwal.fire('خطا', e.message || 'خطا در انجام عملیات', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePagePermissionInAdd = (key: string) => {
    setAddForm(prev => {
      const idx = prev.allowedPages.indexOf(key);
      const updated = [...prev.allowedPages];
      if (idx > -1) {
        updated.splice(idx, 1);
      } else {
        updated.push(key);
      }
      return { ...prev, allowedPages: updated };
    });
  };

  const togglePagePermissionInEdit = (key: string) => {
    setEditForm(prev => {
      const allowed = prev.allowedPages ? [...prev.allowedPages] : [];
      const idx = allowed.indexOf(key);
      if (idx > -1) {
        allowed.splice(idx, 1);
      } else {
        allowed.push(key);
      }
      return { ...prev, allowedPages: allowed };
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-20 overflow-y-auto custom-scrollbar pr-1 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center py-4 bg-slate-50/80 dark:bg-slate-950/80 sticky top-0 z-10 border-b border-transparent">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">مدیریت کاربران و سطوح دسترسی</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            تعیین رمز عبور و مجوز ورود به صفحه‌های برنامه جهت سهامداران، کارمندان و فروشندگان فروشگاه
          </p>
        </div>
        
        {/* Only Admin role can create users */}
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          تنظیم حساب جدید
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            حساب‌های احراز هویت شده
          </h3>
          <span className="text-[10px] bg-slate-105 border py-1 px-2.5 rounded-lg font-bold font-mono">
            {users.length.toLocaleString('fa-IR')} کاربر
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-inner text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 text-[11px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">کد کاربر</th>
                <th className="p-4">نام کاربری (جهت ورود)</th>
                <th className="p-4">شخص متناظر در سیستم</th>
                <th className="p-4">نقش دسترسی</th>
                <th className="p-4">کلمه عبور (Plain)</th>
                <th className="p-4 text-center">مجوز صفحات</th>
                <th className="p-4 text-left">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {users.map(u => {
                const linkedPersonName = u.title || `${u.first_name || ''} ${u.last_name || ''}`.trim() || '---';
                const hasRootAccess = u.role === 'مدیر' || u.permissions === '*';
                const countOfPerms = hasRootAccess ? 'دسترسی کامل' : (u.permissions ? u.permissions.split(',').length + ' صفحه' : 'فاقد دسترسی');

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-slate-700 dark:text-slate-350">
                    <td className="p-4 font-mono font-bold text-slate-400">USR-{u.id}</td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">{u.username}</td>
                    <td className="p-4">
                      {u.person_id ? (
                        <div className="flex flex-col">
                          <span className="font-bold">{linkedPersonName}</span>
                          <span className="text-[9px] text-slate-400">شناسه شخص: p-{u.person_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">عدم متصل به اشخاص</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black",
                        u.role === 'مدیر' ? "bg-red-50 text-red-650 dark:bg-red-950/10 dark:text-red-400" :
                        u.role === 'فروشنده' ? "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/10" :
                        u.role === 'کارمند' ? "bg-emerald-50 text-emerald-650 dark:bg-emerald-950/10" : "bg-slate-100 text-slate-600"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono select-all font-semibold tracking-widest">{u.password}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-bold",
                        hasRootAccess ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-slate-100 text-slate-500"
                      )}>
                        {countOfPerms}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="inline-flex gap-1.5 justify-end">
                        <button 
                          onClick={() => {
                            const allowed = u.permissions === '*' ? SYSTEM_PAGES.map(p => p.key) : (u.permissions ? u.permissions.split(',') : []);
                            setEditForm({
                              ...u,
                              allowedPages: allowed
                            });
                            setIsEditOpen(true);
                          }}
                          className="p-1 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 dark:text-slate-350 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          ویرایش
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id!, u.username)}
                          disabled={activeUser?.id === u.id}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer disabled:opacity-40"
                          title="حذف اکانت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD SYSTEM USER MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 relative shadow-2xl border border-slate-150">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute left-6 top-6 p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 border-b pb-4 mb-5 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              تعریف حساب احراز هویت جدید
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">نام کاربری ورود (انگلیسی)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="reza_sales"
                    value={addForm.username}
                    onChange={(e) => setAddForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">کلمه عبور ورود</label>
                  <input 
                    type="text" 
                    required
                    placeholder="رمز ورود"
                    value={addForm.password}
                    onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5">نقش اصلی کاربر</label>
                  <select 
                    value={addForm.role}
                    onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="مدیر">مدیر سیستم (دسترسی نامحدود)</option>
                    <option value="فروشنده">فروشنده</option>
                    <option value="کارمند">کارمند</option>
                    <option value="کاربر">کاربر معمولی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5">اتصال متناظر به پرونده شخص</label>
                  <select 
                    value={addForm.person_id}
                    onChange={(e) => setAddForm(prev => ({ ...prev, person_id: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- فاقد اتصال (مستقل) --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.type === 'حقوقی' ? p.title : `${p.first_name} ${p.last_name}`} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page Permissions Select */}
              {addForm.role !== 'مدیر' && (
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl">
                  <span className="block text-xs font-black text-indigo-700/80 mb-3">تعیین زیرصفحه‌های مجاز جهت مشاهده:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {SYSTEM_PAGES.map(page => {
                      const isSelected = addForm.allowedPages.includes(page.key);
                      return (
                        <button
                          type="button"
                          key={page.key}
                          onClick={() => togglePagePermissionInAdd(page.key)}
                          className={cn(
                            "flex items-center gap-2 text-right p-2 rounded-xl border text-[11px] font-bold transition-all",
                            isSelected 
                              ? "bg-indigo-50/50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" 
                              : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100"
                          )}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                          {page.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-650 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  افزودن کاربر
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- EDIT SYSTEM USER MODAL --- */}
      {isEditOpen && editForm.id && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 relative shadow-2xl border border-slate-150">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute left-6 top-6 p-1 rounded-full hover:bg-slate-105 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 border-b pb-4 mb-5 flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-500 animate-pulse" />
              ویرایش حساب کاربری {editForm.username}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">نام کاربری</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">کلمه عبور</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5">نقش کاربر</label>
                  <select 
                    value={editForm.role || 'کاربر'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="مدیر">مدیر سیستم (دسترسی نامحدود)</option>
                    <option value="فروشنده">فروشنده</option>
                    <option value="کارمند">کارمند</option>
                    <option value="کاربر">کاربر معمولی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5">اتصال به پرونده شخص</label>
                  <select 
                    value={editForm.person_id || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, person_id: e.target.value }))}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- فاقد اتصال --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.type === 'حقوقی' ? p.title : `${p.first_name} ${p.last_name}`} (کد: {p.accounting_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page Permissions Select */}
              {editForm.role !== 'مدیر' && (
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl">
                  <span className="block text-xs font-black text-indigo-700/80 mb-3">تعیین صفحه‌های مجاز جهت دسترسی:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {SYSTEM_PAGES.map(page => {
                      const isSelected = (editForm.allowedPages || []).includes(page.key);
                      return (
                        <button
                          type="button"
                          key={page.key}
                          onClick={() => togglePagePermissionInEdit(page.key)}
                          className={cn(
                            "flex items-center gap-2 text-right p-2 rounded-xl border text-[11px] font-bold transition-all",
                            isSelected 
                              ? "bg-indigo-50/50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" 
                              : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 animate-none"
                          )}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                          {page.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-105 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-650 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  ذخیره تغییرات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
