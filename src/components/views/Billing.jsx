import React from 'react';

export const Billing = () => {
  const invoices = [
    { id: 'INV-2023-001', patient: 'Michael Chen', date: 'Oct 24, 2023', amount: '$450.00', status: 'Paid' },
    { id: 'INV-2023-002', patient: 'Sarah Jenkins', date: 'Oct 23, 2023', amount: '$1,240.00', status: 'Pending' },
    { id: 'INV-2023-003', patient: 'Emily Davis', date: 'Oct 20, 2023', amount: '$120.00', status: 'Overdue' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">Track patient payments and insurance claims.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          Create Invoice
        </button>
      </div>

      <div className="saas-card overflow-x-auto">
        <table className="w-full saas-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Patient</th>
              <th>Date Issued</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="font-medium text-slate-900">{inv.id}</td>
                <td>{inv.patient}</td>
                <td>{inv.date}</td>
                <td className="font-bold">{inv.amount}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : inv.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
