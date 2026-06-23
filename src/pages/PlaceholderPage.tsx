import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex justify-center items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">در حال ساخت...</h2>
      <p className="text-slate-500 max-w-md">
        این صفحه در مراحل بعدی توسعه پیاده‌سازی خواهد شد.
      </p>
      <div className="mt-8 px-4 py-2 bg-slate-50 text-slate-400 text-sm rounded-lg font-mono" dir="ltr">
        {location.pathname}
      </div>
    </div>
  );
}
