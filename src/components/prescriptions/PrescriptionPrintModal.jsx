import React, { useRef, useContext } from 'react';
import { X, Printer, Pill } from 'lucide-react';
import { ContextProvider } from '../../context/store';

export const PrescriptionPrintModal = ({
  isOpen,
  onClose,
  prescription = null,
  clinicName = "Care Clinic",
  clinicAddress = "Kothrud, Pune - 411038",
  clinicPhone = "094233 80390",
  clinicTiming = "09:00 AM - 02:00 PM | Closed: Thursday"
}) => {
  const printRef = useRef(null);
  const { Patients, Doctors } = useContext(ContextProvider) || {};

  if (!isOpen || !prescription) return null;

  const safePatients = Array.isArray(Patients) ? Patients : (Array.isArray(Patients?.data) ? Patients.data : []);
  const safeDoctors = Array.isArray(Doctors) ? Doctors : (Array.isArray(Doctors?.data) ? Doctors.data : []);

  // Resolve Patient
  const pId = typeof prescription.patientId === 'object' ? (prescription.patientId?._id || prescription.patientId?.id) : prescription.patientId;
  const foundP = safePatients.find((p) => String(p._id || p.id) === String(pId));
  const patient = foundP || (typeof prescription.patientId === 'object' ? prescription.patientId : null);

  const patientName = patient?.full_name || patient?.name || prescription.patientName || 'DEMO PATIENT';
  const patientAge = patient?.age || prescription.patientAge || '—';
  const patientGender = (patient?.gender || prescription.patientGender || 'M').charAt(0).toUpperCase();
  const patientAddress = patient?.address || prescription.patientAddress || 'Pune';
  const patientWeight = prescription.vitalsSnapshot?.weight || patient?.weight || '—';
  const patientHeight = prescription.vitalsSnapshot?.height || patient?.height || '—';
  const patientBP = prescription.vitalsSnapshot?.bloodPressure || '120/80 mmHg';

  // Resolve Doctor
  const dId = typeof prescription.doctorId === 'object' ? (prescription.doctorId?._id || prescription.doctorId?.id) : prescription.doctorId;
  const foundD = safeDoctors.find((d) => String(d._id || d.id) === String(dId));
  const doctor = foundD || (typeof prescription.doctorId === 'object' ? prescription.doctorId : null);

  const doctorName = doctor?.full_name || doctor?.name || prescription.doctorName || 'Dr. Onkar Bhave';
  const doctorQual = doctor?.qualification || 'M.B.B.S., M.D., M.S.';
  const doctorReg = doctor?.reg_no || doctor?.registrationNumber || '270988';

  const rxNumber = prescription.prescriptionNumber || `RX-${(prescription._id || '').slice(-6).toUpperCase()}`;
  const rxDate = prescription.createdAt
    ? new Date(prescription.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

  const followUpDateStr = prescription.followUpDate
    ? new Date(prescription.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    : '';

  // Robust, fully-styled Isolated iframe print
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    // Write content into the iframe and trigger print
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>&nbsp;</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 12mm 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #0f172a;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            }
          </style>
        </head>
        <body onload="window.print();">
            ${content.innerHTML}
        </body>
        </html>
    `);
    doc.close();

    // Clean up the iframe after the print dialog finishes
    iframe.contentWindow.onafterprint = function () {
      document.body.removeChild(iframe);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] my-auto">

        {/* Top Modal Controls */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Prescription Letterhead ({rxNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Rx / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE LETTERHEAD AREA */}
        <div className="p-8 md:p-12 overflow-y-auto bg-white text-slate-900">
          <div ref={printRef} style={{ width: '100%', maxWidth: '100%', margin: '0 auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>

            {/* Header: Doctor on Left, Clinic on Right */}
            <table style={{ width: '100%', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top', width: '55%' }}>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '42px', verticalAlign: 'top' }}>
                            <div style={{ width: '36px', height: '36px', backgroundColor: '#059669', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '20px', lineHeight: '36px', textAlign: 'center' }}>
                              ✚
                            </div>
                          </td>
                          <td style={{ verticalAlign: 'top', paddingLeft: '8px' }}>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', lineHeight: '1.2' }}>
                              {doctorName}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', marginTop: '2px' }}>
                              {doctorQual} | Reg. No: {doctorReg}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td style={{ verticalAlign: 'top', width: '45%', textAlign: 'right' }}>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: '#0284c7', lineHeight: '1.2' }}>
                      {clinicName}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>
                      {clinicAddress}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Ph: {clinicPhone}, Timing: {clinicTiming}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Date Line */}
            <table style={{ width: '100%', marginBottom: '10px' }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                    Date: {rxDate}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Patient Details Block */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', lineHeight: '1.5' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
                ID: {prescription.patientId?._id?.slice(-4) || '14'} - {patientName.toUpperCase()} ({patientGender}) / {patientAge} Y
              </div>
              <div style={{ color: '#334155', fontWeight: '500' }}>
                Address: {patientAddress}
              </div>
              <div style={{ color: '#334155', fontWeight: '500' }}>
                Weight(kg): {patientWeight}, Height(cms): {patientHeight}, BP: {patientBP}
              </div>
              <div style={{ color: '#334155', fontWeight: '500' }}>
                Referred By: Self / {doctorName}
              </div>
              <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>
                Diagnosis: <span style={{ fontWeight: '800', color: '#1e40af' }}>* {Array.isArray(prescription.diagnosis) ? prescription.diagnosis.join(', ') : (prescription.diagnosis || 'General Dental Evaluation')}</span>
              </div>
              {prescription.toothNumbers && prescription.toothNumbers.length > 0 && (
                <div style={{ color: '#1e40af', fontWeight: '700' }}>
                  Teeth Involved (FDI): #{prescription.toothNumbers.join(', #')}
                </div>
              )}
            </div>

            {/* Rx Symbol */}
            <div style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'serif', fontStyle: 'italic', color: '#0f172a', marginTop: '12px', marginBottom: '4px' }}>
              ℞
            </div>

            {/* Exact 3-Column Medicine Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '800', width: '42%' }}>Medicine Name</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '800', width: '38%' }}>Dosage</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '800', width: '20%' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {(prescription.medications || []).map((m, idx) => {
                  const formPrefix = (m.dosageForm || 'Tab').toUpperCase();
                  const freq = m.frequency || 'TDS';
                  const timing = m.timing || 'After Food';
                  const durationVal = m.duration?.value || 5;
                  const durationUnit = m.duration?.unit || 'Days';
                  const qty = m.quantity ? `(Total: ${m.quantity} ${formPrefix === 'TAB' ? 'Tabs' : formPrefix === 'CAP' ? 'Caps' : 'Units'})` : '';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                          {idx + 1}) {formPrefix}. {m.medicineName.toUpperCase()} {m.strength ? `(${m.strength})` : ''}
                        </div>
                        {m.genericName && (
                          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', paddingLeft: '14px' }}>
                            {m.genericName}
                          </div>
                        )}
                        {m.instructions && (
                          <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '600', paddingLeft: '14px', marginTop: '2px' }}>
                            Note: {m.instructions}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                          {m.dosage || '1 dose'}, {freq}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>
                          ({timing})
                        </div>
                      </td>

                      <td style={{ padding: '8px 6px', verticalAlign: 'top', fontWeight: '700', color: '#0f172a' }}>
                        <div>{durationVal} {durationUnit}</div>
                        {qty && <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '400' }}>{qty}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Advice Given */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>Advice Given:</div>
              <div style={{ color: '#1e293b', paddingLeft: '8px' }}>
                * {prescription.generalAdvice || 'Maintain oral hygiene. Avoid chewing on affected side.'}
              </div>
              {prescription.diagnosticTestsAdvised && prescription.diagnosticTestsAdvised.length > 0 && (
                <div style={{ color: '#1e293b', paddingLeft: '8px' }}>
                  * Tests Advised: {prescription.diagnosticTestsAdvised.join(', ')}
                </div>
              )}
            </div>

            {/* Next Follow-Up Date */}
            {followUpDateStr && (
              <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                Next Visit : <span style={{ color: '#1e40af' }}>{followUpDateStr}</span>
                {prescription.followUpInstructions && (
                  <span style={{ fontWeight: '400', color: '#475569', marginLeft: '6px' }}>({prescription.followUpInstructions})</span>
                )}
              </div>
            )}

            {/* Signature Block */}
            <table style={{ width: '100%', marginTop: '40px' }}>
              <tbody>
                <tr>
                  <td></td>
                  <td style={{ width: '200px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia, cursive', fontStyle: 'italic', fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '2px' }}>
                      Signature
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                      {doctorName}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569' }}>
                      {doctorQual}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>

      </div>
    </div>
  );
};
