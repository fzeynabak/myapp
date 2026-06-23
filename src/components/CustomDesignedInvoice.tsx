import React from 'react';
import Decimal from 'decimal.js';
import { Person } from '../types';
import { InvoiceTemplateDesign } from '../utils/invoiceDesignerSettings';
import InvoiceShapes from './InvoiceShapes';

interface CustomDesignedInvoiceProps {
  invoiceDesign: InvoiceTemplateDesign;
  printLayout: 'a4' | 'a5';
  printShopName: string;
  printShopSlogan: string;
  printShopAddress: string;
  printShopPhone: string;
  printShopLogo: string;
  invoiceNumber: string;
  paymentMethod: string;
  selectedCustomer: Person | null;
  items: any[];
  discount: number;
  taxRate: number;
  calculateSubtotal: () => Decimal;
  calculateTax: () => Decimal;
  calculateFinalTotal: () => Decimal;
  installments: any[];
  description: string;
  printColCodeLabel: string;
  printColNameLabel: string;
  printColQtyLabel: string;
  printColPriceLabel: string;
  printColTotalLabel: string;
  printColCurrencyLabel: string;
}

export const CustomDesignedInvoice: React.FC<CustomDesignedInvoiceProps> = ({
  invoiceDesign,
  printLayout,
  printShopName,
  printShopSlogan,
  printShopAddress,
  printShopPhone,
  printShopLogo,
  invoiceNumber,
  paymentMethod,
  selectedCustomer,
  items,
  discount,
  taxRate,
  calculateSubtotal,
  calculateTax,
  calculateFinalTotal,
  installments,
  description,
  printColCodeLabel,
  printColNameLabel,
  printColQtyLabel,
  printColPriceLabel,
  printColTotalLabel,
  printColCurrencyLabel,
}) => {
  // Helper to convert English digits to Persian digits
  const toPersianDigits = (str: string | number): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => persianDigits[parseInt(w)]);
  };

  const formatCurrency = (val: number | string | Decimal) => {
    let num = 0;
    if (val instanceof Decimal) {
      num = val.toNumber();
    } else {
      num = Number(val);
    }
    return toPersianDigits(num.toLocaleString());
  };

  const today = new Date();
  const getSimulatedJalaliDate = () => {
    // Return a beautiful shamsi simulation for display matching current date year
    return '۱۴۰۵/۰۳/۳۰';
  };

  return (
    <div
      id="printable-invoice"
      className={`bg-white text-slate-950 shadow-2xl relative transition-all duration-300 ${
        printLayout === 'a4' ? 'w-[210mm] min-h-[297mm] p-10 text-[11px]' : 'w-[148mm] min-h-[210mm] p-6 text-[9.5px]'
      }`}
      style={{
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: invoiceDesign.fontSizeScale === 'sm' ? '10px' : invoiceDesign.fontSizeScale === 'lg' ? '13px' : invoiceDesign.fontSizeScale === 'xl' ? '15px' : '11px',
        borderWidth: `${invoiceDesign.lineWidth}px`,
        borderColor: '#1e293b',
        borderStyle: invoiceDesign.borderStyle === 'double' ? 'double' : invoiceDesign.borderStyle === 'dashed' ? 'dashed' : 'solid',
        padding: `${invoiceDesign.layoutPadding}px`,
        lineHeight: '1.7',
        direction: 'rtl'
      }}
    >
      {/* SVG Geometric Layouts */}
      <InvoiceShapes primaryColor={invoiceDesign.primaryColor} styleName={invoiceDesign.shapeStyle} />

      <div className="relative z-10 space-y-5">
        {invoiceDesign.sectionsOrder.map((secId) => {
          // 1. Header Block
          if (secId === 'header') {
            return (
              <div key="header" className="border-b border-slate-300 pb-3 h-auto mb-4">
                <div className="flex justify-between items-start md:items-center">
                  {/* Logo representation */}
                  {invoiceDesign.widgets.showLogo ? (
                    <div className="flex items-center gap-2">
                      {printShopLogo ? (
                        <img src={printShopLogo} alt="Logo" className="w-10 h-10 rounded-xl object-contain shadow" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-sm shadow">
                          {printShopName[0] || 'آ'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-xs text-slate-800">{printShopName}</h4>
                        <span className="text-[9px] text-slate-400 font-mono block leading-none">{printShopSlogan}</span>
                      </div>
                    </div>
                  ) : (
                    <h4 className="font-extrabold text-xs text-slate-800">سامانه حسابداری بومی</h4>
                  )}

                  {/* Main Title */}
                  <div className="text-center">
                    <h1 className="font-extrabold text-xs md:text-sm tracking-tight px-3 py-1 rounded" style={{ color: invoiceDesign.primaryColor }}>
                      {invoiceDesign.customInvoiceTitle || 'صورتحساب رسمی فروش کالا/خدمات'}
                    </h1>
                    {invoiceDesign.widgets.showPaymentStatusBadge && (
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[8.5px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm border border-emerald-200">
                         وضعیت تسویه فاکتور: {paymentMethod === 'اقساطی' ? 'اقساطی توافقی' : paymentMethod === 'نسیه' ? 'نسیه/مدت‌دار' : 'تسویه شده نقدی'}
                      </span>
                    )}
                  </div>

                  {/* Custom barcode & meta */}
                  <div className="text-left text-[9.5px] text-slate-500 font-mono space-y-0.5 leading-tight">
                    <div>کد سند مالی: <strong className="text-slate-900 font-bold font-sans">{toPersianDigits(invoiceNumber)}</strong></div>
                    <div>تاریخ صدور مودی: <span>{getSimulatedJalaliDate()}</span></div>
                    
                    {invoiceDesign.widgets.showInvoiceBarcode && (
                      <div className="pt-2 flex flex-col items-end">
                        <div className="w-20 h-4 bg-slate-950 flex items-center justify-between px-1 rounded-sm gap-0.5">
                          {[1,3,2,1,4,2,3,1,2,3,4,1,2,3,4,2,3,1].map((w, i) => (
                            <div key={i} className="bg-white h-3.5" style={{ width: `${w * 0.9}px` }} />
                          ))}
                        </div>
                        <span className="text-[7.5px] text-slate-400 select-none block text-center w-20">98201-9002</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 2. Entities Info Block (Seller and Buyer)
          if (secId === 'entities_info') {
            return (
              <div key="entities_info" className="space-y-3 mb-4 text-[10.5px]">
                <div className="grid grid-cols-2 gap-4">
                  {/* Seller block */}
                  {invoiceDesign.widgets.showSellerDetails && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-1 text-right">
                      <h4 className="font-black text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: invoiceDesign.primaryColor }}></span>
                        مشخصات صادرکننده فاکتور (کسب و کار)
                      </h4>
                      <div className="space-y-0.5 leading-relaxed text-slate-700">
                        <div><strong>نام حقوقی مودی:</strong> {printShopName}</div>
                        <div><strong>تلفن رسمی تماس:</strong> <span className="font-mono">{toPersianDigits(printShopPhone)}</span></div>
                        <div><strong>نشانی استقرار مودی:</strong> {printShopAddress}</div>
                      </div>
                    </div>
                  )}

                  {/* Buyer Details block */}
                  {invoiceDesign.widgets.showBuyerDetails && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-1 text-right">
                      <h4 className="font-black text-[11px] border-b border-slate-200 pb-1 flex items-center gap-1 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: invoiceDesign.primaryColor }}></span>
                        مشخصات طرف معامله (خریدار)
                      </h4>
                      <div className="space-y-0.5 leading-relaxed text-slate-700">
                        <div><strong>خریدار کالا:</strong> <strong>{selectedCustomer ? `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}` : 'خریدار متفرقه عمومی'}</strong></div>
                        <div><strong>کد ملی حقیقی خریدار:</strong> <span className="font-mono">{selectedCustomer ? toPersianDigits(selectedCustomer.national_id || '') : '---'}</span></div>
                        <div><strong>شماره تماس همراه:</strong> <span className="font-mono">{selectedCustomer ? toPersianDigits(selectedCustomer.phone1 || '') : '---'}</span></div>
                        <div className="truncate"><strong>نشانی کامل خریدار:</strong> {selectedCustomer ? selectedCustomer.address || 'نشانی عمومی' : '---'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 3. Items list block
          if (secId === 'items_table') {
            return (
              <div key="items_table" className="border border-slate-300 rounded-xl overflow-hidden mb-4 bg-white">
                <table className="w-full text-right border-collapse text-[10.5px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-800" style={{ backgroundColor: invoiceDesign.secondaryColor || '#f1f5f9' }}>
                      {invoiceDesign.widgets.showItemIndexNumber && (
                        <th className="p-2 border-l border-slate-200 text-center w-8 font-black">ردیف</th>
                      )}
                      {invoiceDesign.widgets.showBarcodeColumn && (
                        <th className="p-2 border-l border-slate-200 text-center w-18">{printColCodeLabel}</th>
                      )}
                      <th className="p-2 border-l border-slate-200 font-extrabold">{printColNameLabel}</th>
                      {invoiceDesign.widgets.showUnitColumn && (
                        <th className="p-2 border-l border-slate-200 text-center w-12">واحد</th>
                      )}
                      <th className="p-2 border-l border-slate-200 text-center w-14">{printColQtyLabel}</th>
                      <th className="p-2 border-l border-slate-200 text-left w-24">{printColPriceLabel} ({printColCurrencyLabel})</th>
                      {invoiceDesign.widgets.showItemDiscountField && (
                        <th className="p-2 border-l border-slate-200 text-left w-16">تخفیف</th>
                      )}
                      <th className="p-2 text-left w-28">{printColTotalLabel} ({printColCurrencyLabel})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((it, idx) => (
                      <tr key={it.product.id || idx} className="h-8">
                        {invoiceDesign.widgets.showItemIndexNumber && (
                          <td className="p-2 border-l border-slate-250 text-center font-mono font-bold text-slate-500">{toPersianDigits(idx + 1)}</td>
                        )}
                        {invoiceDesign.widgets.showBarcodeColumn && (
                          <td className="p-2 border-l border-slate-250 text-center font-mono text-[9px] text-slate-400">#{toPersianDigits(it.product.code || '---')}</td>
                        )}
                        <td className="p-2 border-l border-slate-250 font-black text-slate-800 text-xs text-right">{it.product.name}</td>
                        {invoiceDesign.widgets.showUnitColumn && (
                          <td className="p-2 border-l border-slate-250 text-center">{it.product.unit || 'عدد'}</td>
                        )}
                        <td className="p-2 border-l border-slate-250 text-center font-bold font-mono text-sm">{toPersianDigits(it.quantity)}</td>
                        <td className="p-2 border-l border-slate-250 text-left font-mono font-bold text-slate-650">{toPersianDigits(Number(it.price ?? it.unit_price ?? 0).toLocaleString())}</td>
                        {invoiceDesign.widgets.showItemDiscountField && (
                          <td className="p-2 border-l border-slate-250 text-left font-mono text-red-600">۰</td>
                        )}
                        <td className="p-2 text-left font-mono font-black text-sm" style={{ color: invoiceDesign.primaryColor }}>
                          {toPersianDigits(new Decimal(it.price ?? it.unit_price ?? 0).mul(it.quantity ?? 0).toNumber().toLocaleString())}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // 4. Financial receipts calculations & terms
          if (secId === 'financial_receipt') {
            return (
              <div key="financial_receipt" className="space-y-3 mb-4 text-[10.5px]">
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* Observations / Terms / Installments */}
                  <div className="col-span-7 border border-slate-200 p-3 rounded-xl bg-slate-50/50 space-y-1 text-right">
                    <span className="font-bold text-slate-700 block text-[11px]">شرایط، ضوابق و پی‌نویس معامله:</span>
                    {invoiceDesign.widgets.showTermsAndFooterText ? (
                      <p className="text-slate-600 text-[10px] leading-relaxed text-justify h-auto whitespace-pre-line font-bold">
                        {description || invoiceDesign.customTermsNote}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-[9.5px] italic">توضیحات فاکتور توسط شما مخفی یا غیرفعال شده است.</p>
                    )}

                    {/* Installments Breakdown if Installments selected */}
                    {paymentMethod === 'اقساطی' && installments.length > 0 && (
                      <div className="mt-2 text-[9px] pt-2 border-t border-slate-200 text-right">
                        <h5 className="font-extrabold text-indigo-700 mb-1">جدول رسمی سررسید اقساط این فاکتور:</h5>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                          {installments.map((inst, idx) => (
                            <div key={idx} className="flex justify-between border-b pb-0.5 text-slate-700 font-mono">
                              <span>رویداد {toPersianDigits(idx + 1)}:</span>
                              <span>{formatCurrency(inst.amount)} {printColCurrencyLabel} ({toPersianDigits(inst.dueDate)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Math calculations summary */}
                  <div className="col-span-5 border border-slate-200 py-2.5 px-3.5 rounded-xl bg-slate-50/50 space-y-1.5 divide-y divide-slate-200 text-right">
                    <div className="flex justify-between items-center pb-0.5 text-slate-500 font-bold">
                      <span>جمع کل خام فروش اقلام:</span>
                      <span className="font-mono">{formatCurrency(calculateSubtotal())} {printColCurrencyLabel}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center py-1 text-red-600 font-bold h-6">
                        <span>کاهش میزان تخفیفات:</span>
                        <span className="font-mono">-{formatCurrency(discount)} {printColCurrencyLabel}</span>
                      </div>
                    )}
                    {invoiceDesign.widgets.showTaxAndAdditions && taxRate > 0 && (
                      <div className="flex justify-between items-center py-1 text-amber-700 font-bold h-6">
                        <span>مالیات ارزش افزوده ({taxRate}%):</span>
                        <span className="font-mono">+{formatCurrency(calculateTax())} {printColCurrencyLabel}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1.5 font-black text-xs" style={{ color: invoiceDesign.primaryColor }}>
                      <span>جمع خالص قابل پرداخت:</span>
                      <span className="font-mono text-xs font-black">{formatCurrency(calculateFinalTotal())} {printColCurrencyLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // 5. Signature Boxes
          if (secId === 'signatures') {
            return (
              <div key="signatures" className="h-auto pb-4 pt-1">
                {invoiceDesign.widgets.showSignatureBoxes ? (
                  <div className="grid grid-cols-2 gap-4 text-center text-[10px]">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/20 shadow-xs h-24 flex flex-col justify-between">
                      <strong className="text-slate-600 font-bold text-xs">{invoiceDesign.customSellerStampLabel || 'مهر و امضای صادرکننده'}</strong>
                      <span className="text-[9px] text-slate-400 font-mono italic">تایید بیع و گواهی تسویه صندوق</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/20 shadow-xs h-24 flex flex-col justify-between">
                      <strong className="text-slate-600 font-bold text-xs">{invoiceDesign.customBuyerSignatureLabel || 'اثر انگشت و امضای گیرنده'}</strong>
                      <span className="text-[9px] text-slate-400 italic">گواهی صحت اصابت معامله و تحویل فیزیکی کالا</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
