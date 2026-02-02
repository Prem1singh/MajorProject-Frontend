import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/image.png"
export default function StudentMarks() {
  const user = useSelector((state) => state.user.data);
  const [marksData, setMarksData] = useState([]);
  const [exams, setExams] = useState([]);
console.log(exams)
  console.log(user)
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await api.get("/marks/student");
        const marks = res.data || [];
        const uniqueExams = Array.from(
          new Map(marks.map((m) => [m.exam._id, m.exam])).values()
        );
        setExams(uniqueExams);
        setMarksData(marks);
      } catch (err) {
        console.error("Error fetching student marks:", err);
      }
    };
    fetchMarks();
  }, [user?._id]);

  const groupedBySubject = marksData.reduce((acc, m) => {
    if (!acc[m.subject._id]) {
      acc[m.subject._id] = { subject: m.subject, exams: {} };
    }
    acc[m.subject._id].exams[m.exam._id] = m;
    return acc;
  }, {});

  const downloadPDF = () => {
    // 1. Initialization
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 2. Logo & University Branding
    const logoHeight = 22;
    const logoWidth = 22;
    const logoY = 10;
    
    try {
      // Ensure 'logo' is imported at the top of your file
      doc.addImage(logo, 'PNG', (pageWidth / 2) - (logoWidth / 2), logoY, logoWidth, logoHeight);
    } catch (e) {
      console.error("Logo failed to render. Check if logo is imported correctly.", e);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Central University of Haryana", pageWidth / 2, 38, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Established under Central Universities Act, 2009", pageWidth / 2, 43, { align: "center" });
    doc.text("Jant-Pali, Mahendergarh, Haryana, Pin Code: 123031", pageWidth / 2, 47, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 52, pageWidth - 14, 52); 

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT OF MARKS", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${user?.course || "Master of Computer Application"}`, pageWidth / 2, 66, { align: "center" });

    // 3. Student Information Section
    doc.setFillColor(248, 249, 250);
    doc.rect(14, 72, pageWidth - 28, 20, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Student Details", 18, 77);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${user?.name || "N/A"}`, 18, 83);
    doc.text(`Roll Number: ${user?.rollNo || "N/A"}`, 18, 88);
    
    doc.text(`Semester: ${user?.semester || "N/A"}`, 110, 83);
    doc.text(`Session: 2025-2026`, 110, 88);

    // 4. Dynamic Table with Subject-wise Pass/Fail
    const tableColumn = ["Subject", ...exams.map(e => e.name), "Total", "Status"];
    
    let grandTotalObtained = 0;
    let grandMaxMarks = 0;

    const tableRows = Object.values(groupedBySubject).map((row) => {
      let subjectTotal = 0;
      let subjectMax = 0;

      const examMarks = exams.map((exam) => {
        const markEntry = row.exams[exam._id];
        const obtained = markEntry ? markEntry.obtained : 0;
        subjectTotal += obtained;
        subjectMax += exam.totalMarks;
        return markEntry ? obtained.toString() : "0";
      });

      grandTotalObtained += subjectTotal;
      grandMaxMarks += subjectMax;

      // Logic: Pass if obtained >= 40% of max marks for that subject
      const passPercentage = (subjectTotal / subjectMax) * 100;
      const status = passPercentage >= 40 ? "P" : "F";

      return [row.subject.name, ...examMarks, subjectTotal.toString(), status];
    });

    autoTable(doc, {
      startY: 98,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      columnStyles: { 
        0: { halign: 'left', cellWidth: 50, fontStyle: 'bold' },
        // Last column (Status) styling
        [tableColumn.length - 1]: { fontStyle: 'bold' } 
      },
      didParseCell: (data) => {
        // Optional: Color the 'F' status red
        if (data.section === 'body' && data.column.index === tableColumn.length - 1) {
          if (data.cell.raw === 'F') {
            data.cell.styles.textColor = [200, 0, 0];
          }
        }
      }
    });

    // 5. Final Result Summary
    const finalY = doc.lastAutoTable.finalY + 15;
    const totalPercentage = grandMaxMarks > 0 ? ((grandTotalObtained / grandMaxMarks) * 100).toFixed(2) : 0;
    const finalResult = totalPercentage >= 40 ? "PASS" : "FAIL";

    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.rect(14, finalY - 5, 85, 25); 

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Grand Total: ${grandTotalObtained} / ${grandMaxMarks}`, 18, finalY + 2);
    doc.text(`Percentage: ${totalPercentage}%`, 18, finalY + 9);
    doc.text(`Final Result: ${finalResult}`, 18, finalY + 16);

    // 6. Signature Area
    doc.setFontSize(9);
    doc.text("Controller of Examinations", pageWidth - 60, finalY + 35);

    doc.save(`${user?.name || "Student"}_Marksheet.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 My Marks</h2>
          <p className="text-sm text-gray-600">{user?.course || "Course not found"}</p>
        </div>
        
        {marksData.length > 0 && (
          <button 
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 shadow-lg transition"
          >
            Download PDF
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {marksData.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Subject</th>
                {exams.map((exam) => (
                  <th key={exam._id} className="p-3 border text-center">
                    {exam.name} <span className="block text-xs font-normal">({exam.totalMarks})</span>
                  </th>
                ))}
                <th className="p-3 border text-center font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedBySubject).map((row) => {
                const total = exams.reduce((sum, exam) => sum + (row.exams[exam._id]?.obtained || 0), 0);
                return (
                  <tr key={row.subject._id} className="hover:bg-gray-50">
                    <td className="p-3 border font-medium">{row.subject.name}</td>
                    {exams.map((exam) => (
                      <td key={exam._id} className="p-3 border text-center">
                        {row.exams[exam._id]?.obtained ?? "-"}
                      </td>
                    ))}
                    <td className="p-3 border text-center font-bold bg-gray-50">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-gray-500">No marks found.</div>
        )}
      </div>
    </div>
  );
}