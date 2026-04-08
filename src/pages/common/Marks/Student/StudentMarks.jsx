import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/image.png";
import { 
  FiAward, FiDownload,FiXCircle,FiUser, FiCheckCircle, 
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

  // PDF Download Logic (Unchanged as per your request, just styled the trigger)
  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    try { doc.addImage(logo, 'PNG', (pageWidth / 2) - 11, 10, 22, 22); } catch (e) {}

    doc.setFont("helvetica", "bold").setFontSize(15);
    doc.text("Central University of Haryana", pageWidth / 2, 38, { align: "center" });
    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text("Jant-Pali, Mahendergarh, Haryana, Pin Code: 123031", pageWidth / 2, 47, { align: "center" });
    doc.line(14, 52, pageWidth - 14, 52); 

    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text("STATEMENT OF MARKS", pageWidth / 2, 60, { align: "center" });
    
    doc.setFillColor(248, 249, 250);
    doc.rect(14, 72, pageWidth - 28, 20, 'F');
    doc.setFontSize(9).text(`Name: ${user?.name || "N/A"}`, 18, 83);
    doc.text(`Roll Number: ${user?.rollNo || "N/A"}`, 18, 88);

    const tableColumn = ["Subject", ...exams.map(e => e.name), "Total", "Status"];
    const tableRows = Object.values(groupedBySubject).map((row) => {
      let subTotal = 0; let subMax = 0;
      const examMarks = exams.map((exam) => {
        const mark = row.exams[exam._id]?.obtained || 0;
        subTotal += mark; subMax += exam.totalMarks;
        return mark.toString();
      });
      const status = (subTotal / subMax) * 100 >= 40 ? "P" : "F";
      return [row.subject.name, ...examMarks, subTotal.toString(), status];
    });

    autoTable(doc, {
      startY: 98, head: [tableColumn], body: tableRows, theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] } // Emerald color
    });

    doc.save(`${user?.name || "Student"}_Marksheet.pdf`);
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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Examination Result</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Viewing academic performance records for {user?.course || "MCA"}.</p>
        </div>
        
        {marksData.length > 0 && (
          <button 
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            <FiDownload strokeWidth={3} /> Export Marksheet
          </button>
        )}
      </header>

      {/* Result Grid */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <FiFileText className="text-emerald-500" /> Subject-wise Breakdown
            </h3>
            <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 tracking-widest uppercase">
                Session 2025-26
            </span>
        </div>

        <div className="overflow-x-auto">
          {marksData.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Subject</th>
                  {exams.map((exam) => (
                    <th key={exam._id} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      {exam.name}
                      <span className="block text-[8px] text-emerald-500 font-bold mt-1">MAX: {exam.totalMarks}</span>
                    </th>
                  ))}
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50/50">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.values(groupedBySubject).map((row) => {
                  const total = exams.reduce((sum, exam) => sum + (row.exams[exam._id]?.obtained || 0), 0);
                  const maxPossible = exams.reduce((sum, exam) => sum + exam.totalMarks, 0);
                  const isPass = (total / maxPossible) * 100 >= 40;

                  return (
                    <tr key={row.subject._id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                             <FiBook size={14} />
                          </div>
                          <span className="font-bold text-slate-700">{row.subject.name}</span>
                        </div>
                      </td>
                      {exams.map((exam) => (
                        <td key={exam._id} className="p-6 text-center font-bold text-slate-600">
                          {row.exams[exam._id]?.obtained ?? <span className="text-slate-200">-</span>}
                        </td>
                      ))}
                      <td className="p-6 text-center bg-slate-50/50">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-slate-900">{total}</span>
                            {isPass ? 
                                <span className="text-[8px] font-black text-emerald-600 flex items-center gap-0.5"><FiCheckCircle /> PASS</span> : 
                                <span className="text-[8px] font-black text-red-500 flex items-center gap-0.5"><FiXCircle /> FAIL</span>
                            }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center text-slate-400 italic font-medium">
                <FiInfo className="mx-auto mb-4 text-slate-200" size={40} />
                No examination records published for this semester.
            </div>
          )}
        </div>
      </div>

      {/* Student Quick Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard icon={<FiUser />} label="Student Name" value={user?.name} />
          <InfoCard icon={<FiHash />} label="Roll Number" value={user?.rollNo} />
          <InfoCard icon={<FiAward />} label="Current Semester" value={`Semester ${user?.semester || '4'}`} />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-emerald-600 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-800">{value || 'N/A'}</p>
            </div>
        </div>
    );
}