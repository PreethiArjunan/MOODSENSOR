// js/exportPDF.js
// requires <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> in the page

window.exportMoodHistoryToPDF = function(payload) {
  const { jsPDF } = window.jspdf || window.jspdf; // UMD global
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const margin = 36;
  let y = 40;

  doc.setFontSize(18);
  doc.text("MoodSense — Mood History Report", margin, y);
  y += 28;
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 22;

  // Pie image
  if (payload.pieDataUrl) {
    doc.addImage(payload.pieDataUrl, 'PNG', margin, y, 260, 160);
  }
  // Bar image
  if (payload.barDataUrl) {
    doc.addImage(payload.barDataUrl, 'PNG', margin + 290, y, 260, 160);
  }
  y += 180;

  doc.setFontSize(14);
  doc.text("Entries:", margin, y);
  y += 18;
  doc.setFontSize(10);

  // Add rows (date - mood - note)
  const rows = payload.rows || [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const text = `${r.dateLocal || r.dateISO} ${r.timeLocal || ''} — ${r.mood} ${r.note ? "- " + r.note : ""}`;
    // if page full -> new page
    if (y > 740) { doc.addPage(); y = 40; }
    doc.text(text, margin, y);
    y += 16;
  }

  doc.save("mood-history.pdf");
};