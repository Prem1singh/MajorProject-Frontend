import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/image.png";
import { 
  FiAward, FiDownload, FiXCircle, FiUser, FiCheckCircle, 
  FiFileText, FiHash, FiBook, FiInfo 
} from "react-icons/fi";

export default function StudentMarks() {
  const user = useSelector((state) => state.user.data);
  const [marksData, setMarksData] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/marks/student");
        const marks = res.data || [];
        const uniqueExams = Array.from(
          new Map(marks.map((m) => [m.exam._id, m.exam])).values()
        );
        setExams(uniqueExams);
        setMarksData(marks);
      } catch (err) {
        console.error("Error fetching marks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [user?._id]);

  const groupedBySubject = useMemo(() => {
    return marksData.reduce((acc, m) => {
      if (!acc[m.subject._id]) {
        acc[m.subject._id] = { subject: m.subject, exams: {} };
      }
      acc[m.subject._id].exams[m.exam._id] = m;
      return acc;
    }, {});
  }, [marksData]);

  // --- Premium Embedded PDF Logic ---
 // --- Premium Embedded PDF Logic (v2.0 - Background Watermark & Summary) ---
 const downloadPDF = () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. --- STAGE 1: Background Elements (Sabse pehle draw honge) ---
  
  // Light Watermark (Diagonal)
  doc.setTextColor(245, 245, 245); // Very light gray
  doc.setFontSize(45).setFont("helvetica", "bold");
  doc.text("CUH OFFICIAL TRANSCRIPT", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });

  // Dual Elegant Borders
  doc.setDrawColor(16, 185, 129); // Emerald
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Outer
  doc.setDrawColor(30, 41, 59); // Slate
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14); // Inner

  // 2. --- STAGE 2: Header & Branding (Watermark ke upar) ---
  try { 
    doc.addImage(logo, 'PNG', (pageWidth / 2) - 12, 12, 24, 24); 
  } catch (e) { console.error("Logo missing"); }
  
  doc.setTextColor(30, 41, 59); // Reset text color to dark slate
  doc.setFont("helvetica", "bold").setFontSize(18);
  doc.text("CENTRAL UNIVERSITY OF HARYANA", pageWidth / 2, 45, { align: "center" });
  
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
  doc.text("Established vide Act No. 25 (2009) of Parliament", pageWidth / 2, 50, { align: "center" });
  doc.text("Jant-Pali, Mahendergarh, Haryana, Pin Code: 123031", pageWidth / 2, 54, { align: "center" });
  
  doc.setDrawColor(226, 232, 240); // Light gray line
  doc.line(20, 58, pageWidth - 20, 58);

  // 3. --- Marksheet Title Badge ---
  doc.setFillColor(16, 185, 129); // Emerald background
  doc.rect((pageWidth / 2) - 35, 63, 70, 10, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(11).setFont("helvetica", "bold");
  doc.text("OFFICIAL TRANSCRIPT", pageWidth / 2, 69.5, { align: "center" });

  // 4. --- Student Info Section (Boxed) ---
  doc.setTextColor(30, 41, 59);
  doc.setFillColor(248, 250, 252); // Very light slate background
  doc.rect(15, 78, pageWidth - 30, 25, 'F');
  doc.setDrawColor(226, 232, 240); // Light border
  doc.rect(15, 78, pageWidth - 30, 25, 'S');

  doc.setFontSize(9).setFont("helvetica", "bold");
  doc.text(`STUDENT NAME :`, 20, 85);
  doc.text(`ROLL NUMBER  :`, 20, 91);
  doc.text(`PROGRAMME    :`, 20, 97);
  
  doc.setFont("helvetica", "normal");
  doc.text(user?.name?.toUpperCase() || "N/A", 55, 85);
  doc.text(user?.rollNo || "N/A", 55, 91);
  // Dynamic Department/Semester Info
  const programme = `${user?.department || "COMPUTER SCIENCE"} (SEM-${user?.semester || '4'})`;
  doc.text(programme.toUpperCase(), 55, 97);

  // 5. --- Table Data Calculation & Generation ---
  const tableColumn = ["Subject", ...exams.map(e => e.name), "Aggregate", "Grade"];
  
  // Grand Total Variables
  let grandObtained = 0;
  let grandTotalMax = 0;

  const tableRows = Object.values(groupedBySubject).map((row) => {
    let subTotal = 0; 
    let subMax = 0;
    const examMarks = exams.map((exam) => {
      const mark = row.exams[exam._id]?.obtained || 0;
      subTotal += mark; 
      subMax += exam.totalMarks;
      return mark.toString();
    });
    
    // Add to Grand Totals
    grandObtained += subTotal;
    grandTotalMax += subMax;

    const per = (subTotal / subMax) * 100;
    const grade = per >= 80 ? 'A+' : per >= 60 ? 'A' : per >= 40 ? 'B' : 'F';
    
    return [
      row.subject.name.toUpperCase(), 
      ...examMarks, 
      `${subTotal}/${subMax}`, 
      grade
    ];
  });

  // Draw Table
  autoTable(doc, {
    startY: 108,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 41, 59], // Dark Slate
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { 
      fontSize: 8, 
      halign: 'center', 
      valign: 'middle',
      textColor: [51, 65, 85] 
    },
    columnStyles: { 
      0: { halign: 'left', cellWidth: 50, fontStyle: 'bold' }, // Subject name wider
      [tableColumn.length - 1]: { fontStyle: 'bold' } // Grade bold
    },
    alternateRowStyles: { fillColor: [252, 254, 255] },
    margin: { left: 15, right: 15 }
  });

  // 6. --- NEW: Result Summary Box (Total Percentage & Overall Status) ---
  const summaryY = doc.lastAutoTable.finalY + 10;
  const finalPercentage = grandTotalMax > 0 ? ((grandObtained / grandTotalMax) * 100).toFixed(2) : "0.00";
  const overallStatus = finalPercentage >= 40 ? "PASSED" : "FAILED";
  const statusColor = finalPercentage >= 40 ? [16, 185, 129] : [239, 68, 68]; // Emerald vs Red

  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.rect(pageWidth - 95, summaryY, 80, 22, 'FD'); // Summary Box

  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(71, 85, 105); // Slate 600
  doc.text("GRAND TOTAL :", pageWidth - 90, summaryY + 7);
  doc.text("PERCENTAGE  :", pageWidth - 90, summaryY + 13);
  doc.text("OVERALL RESULT :", pageWidth - 90, summaryY + 19);

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(`${grandObtained} / ${grandTotalMax}`, pageWidth - 45, summaryY + 7, { align: "right" });
  doc.text(`${finalPercentage} %`, pageWidth - 45, summaryY + 13, { align: "right" });
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]); // Dynamic Color
  doc.text(overallStatus, pageWidth - 45, summaryY + 19, { align: "right" });

  // 7. --- Signature & Footer ---
  const footerY = summaryY + 35;
  doc.setTextColor(100);
  doc.setFontSize(9).setFont("helvetica", "bold");
  doc.text("Date of Declaration: " + new Date().toLocaleDateString(), 15, footerY);
  
  doc.setTextColor(30, 41, 59);
  doc.line(pageWidth - 65, footerY + 10, pageWidth - 15, footerY + 10);
  doc.text("Controller of Examinations", pageWidth - 40, footerY + 15, { align: "center" });

  // Save the PDF
  doc.save(`${user?.rollNo || "Student"}_Final_Transcript.pdf`);
};

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
              <FiAward size={24} />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight italic uppercase">Academic Performance</h2>
          </div>
          <p className="text-slate-500 font-medium italic text-sm">Official semester-wise examination records.</p>
        </div>
        
        {marksData.length > 0 && (
          <button 
            onClick={downloadPDF}
            className="group flex items-center justify-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            <FiDownload strokeWidth={3} className="group-hover:translate-y-0.5 transition-transform"/> Export Transcript
          </button>
        )}
      </header>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <FiFileText className="text-emerald-500" /> Subject Gradesheet
            </h3>
        </div>

        <div className="overflow-x-auto">
          {marksData.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Subject</th>
                  {exams.map((exam) => (
                    <th key={exam._id} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      {exam.name}
                      <span className="block text-[8px] text-emerald-500 font-bold mt-1">MAX: {exam.totalMarks}</span>
                    </th>
                  ))}
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/50">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.values(groupedBySubject).map((row) => {
                  const total = exams.reduce((sum, exam) => sum + (row.exams[exam._id]?.obtained || 0), 0);
                  const maxPossible = exams.reduce((sum, exam) => sum + exam.totalMarks, 0);
                  const isPass = (total / maxPossible) * 100 >= 40;

                  return (
                    <tr key={row.subject._id} className="hover:bg-emerald-50/10 transition-colors">
                      <td className="p-6 font-bold text-slate-700 italic text-sm">{row.subject.name}</td>
                      {exams.map((exam) => (
                        <td key={exam._id} className="p-6 text-center font-black text-slate-500 text-sm">
                          {row.exams[exam._id]?.obtained ?? "-"}
                        </td>
                      ))}
                      <td className="p-6 text-center bg-slate-50/50">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                           {isPass ? <><FiCheckCircle /> Pass</> : <><FiXCircle /> Fail</>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
                <FiInfo className="mx-auto mb-4 text-slate-200" size={40} />
                <p className="text-slate-400 font-bold italic">No examination records published yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard icon={<FiUser />} label="Student Identity" value={user?.name} />
          <InfoCard icon={<FiHash />} label="University Roll No" value={user?.rollNo} />
          <InfoCard icon={<FiAward />} label="Academic Progress" value={`Semester ${user?.semester || '4'}`} />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-emerald-100 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{value || 'N/A'}</p>
            </div>
        </div>
    );
}