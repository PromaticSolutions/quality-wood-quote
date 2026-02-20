import jsPDF from 'jspdf';
import { Budget, Room, calculateRoomSubtotal, calculateBudgetTotal, formatCurrency } from '@/types/budget';

export async function generateBudgetPDF(budget: Budget) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const colors = {
    primary: [26, 58, 82] as [number, number, number],
    accent: [45, 90, 140] as [number, number, number],
    lightBg: [240, 244, 248] as [number, number, number],
    text: [51, 51, 51] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    border: [208, 216, 224] as [number, number, number],
  };

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  }

  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(...colors.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MARCENARIA QUALITY', margin, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Orçamento de Projeto', margin, 22);
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin, 15, { align: 'right' });
  y = 40;

  // Client info
  doc.setFillColor(...colors.lightBg);
  doc.rect(margin, y, contentWidth, 28, 'F');
  doc.setDrawColor(...colors.border);
  doc.rect(margin, y, contentWidth, 28, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;

  doc.text('CLIENTE', col1, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.text(budget.clientName || '-', col1, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('ARQUITETA', col2, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.text(budget.architectName || '-', col2, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('PRAZO DE ENTREGA', col1, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.text(`${budget.deliveryDays} dias úteis`, col1, y + 26);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('FORMA DE PAGAMENTO', col2, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  const payText = budget.paymentTerms || '-';
  doc.text(payText.substring(0, 50), col2, y + 26);

  y += 36;

  // Rooms & items
  for (const room of budget.rooms) {
    const subtotal = calculateRoomSubtotal(room);
    checkPage(25 + room.items.length * 14);

    // Room header
    doc.setFillColor(...colors.primary);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(...colors.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(room.name.toUpperCase(), margin + 4, y + 5.5);
    doc.text(formatCurrency(subtotal), pageWidth - margin - 4, y + 5.5, { align: 'right' });
    y += 10;

    // Table header
    doc.setFillColor(...colors.lightBg);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(...colors.primary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 4, y + 5);
    doc.text('MEDIDAS', margin + 75, y + 5);
    doc.text('OBSERVAÇÕES', margin + 110, y + 5);
    doc.text('VALOR', pageWidth - margin - 4, y + 5, { align: 'right' });
    y += 9;

    // Items
    for (const item of room.items) {
      checkPage(12);
      doc.setDrawColor(...colors.border);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);

      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(item.name.substring(0, 30), margin + 4, y + 5);

      doc.setFontSize(8);
      doc.text(item.measurements?.substring(0, 15) || '-', margin + 75, y + 5);

      const obs = item.observations?.substring(0, 25) || '-';
      doc.text(obs, margin + 110, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(formatCurrency(item.value), pageWidth - margin - 4, y + 5, { align: 'right' });

      y += 9;
    }

    y += 6;
  }

  // Total
  checkPage(30);
  y += 4;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setTextColor(...colors.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DO PROJETO', margin + 4, y + 9);

  const displayTotal = budget.customTotal ?? calculateBudgetTotal(budget);
  doc.setFontSize(14);
  doc.text(formatCurrency(displayTotal), pageWidth - margin - 4, y + 9, { align: 'right' });

  // Payment terms
  if (budget.paymentTerms) {
    y += 20;
    checkPage(15);
    doc.setTextColor(...colors.primary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDIÇÕES DE PAGAMENTO', margin, y);
    y += 5;
    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(budget.paymentTerms, contentWidth);
    doc.text(lines, margin, y);
  }

  // Footer
  const footerY = 285;
  doc.setDrawColor(...colors.border);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setFontSize(8);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Marcenaria Quality', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text('Pablo Santos  •  (11) 91639-5199', margin, footerY + 4);

  const fileName = `Orcamento_${budget.clientName?.replace(/\s+/g, '_') || 'novo'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
