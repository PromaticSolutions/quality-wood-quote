import jsPDF from 'jspdf';
import { Budget, Room, calculateRoomSubtotal, calculateBudgetTotal, formatCurrency } from '@/types/budget';
import logoImg from '@/assets/logo-marcenaria.png';
import { getClient } from '@/store/clientStore';
import { getMyProfile } from '@/store/profileStore';

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function generateBudgetPDF(budgetInput: Budget) {
  const profile = await getMyProfile();
  const companyName = (profile?.companyName || 'Marcenaria Quality').toUpperCase();
  const companyCNPJ = profile?.cnpj || '63.111.412/0001-19';
  const companyPhone = profile?.phone || '(11) 91639-5199';
  const companyOwner = profile?.fullName || 'Pablo Santos';
  const customLogo = profile?.logoUrl ? await loadImageAsDataURL(profile.logoUrl) : null;
  // Enrich with up-to-date linked client (if any)
  let budget = budgetInput;
  if (budgetInput.clientId) {
    const c = await getClient(budgetInput.clientId);
    if (c) {
      budget = {
        ...budgetInput,
        clientName: c.name,
        clientAddress: c.address && c.number ? `${c.address}, ${c.number}` : (c.address || budgetInput.clientAddress),
        clientNeighborhood: c.neighborhood || budgetInput.clientNeighborhood,
        clientCity: c.city || budgetInput.clientCity,
        clientState: c.state || budgetInput.clientState,
      };
    }
  }
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Neutral print-friendly palette
  const colors = {
    headerBg: [243, 244, 246] as [number, number, number],  // #F3F4F6
    border: [209, 213, 219] as [number, number, number],     // #D1D5DB
    text: [55, 65, 81] as [number, number, number],          // #374151
    textLight: [107, 114, 128] as [number, number, number],  // #6B7280
    white: [255, 255, 255] as [number, number, number],
    accentStrip: [180, 140, 80] as [number, number, number], // gold top strip only
    black: [0, 0, 0] as [number, number, number],
  };

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      // Gold strip on new pages
      doc.setFillColor(...colors.accentStrip);
      doc.rect(0, 0, pageWidth, 2, 'F');
      y = margin;
    }
  }

  // ── Gold decorative strip at top ──────────────────────────────────────────
  doc.setFillColor(...colors.accentStrip);
  doc.rect(0, 0, pageWidth, 2, 'F');
  y = 8;

  // ── Logo + Company Name ──────────────────────────────────────────────────
  const logoH = 18;
  const logoW = 18;
  try {
    doc.addImage(logoImg, 'PNG', margin, y, logoW, logoH);
  } catch {
    // Logo failed to load — skip gracefully
  }

  const textX = margin + logoW + 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text('MARCENARIA QUALITY', textX, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textLight);
  doc.text('Orçamento de Projeto  •  CNPJ: 63.111.412/0001-19', textX, y + 13);
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin, y + 7, { align: 'right' });

  y += logoH + 6;

  // Divider
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Client Info ──────────────────────────────────────────────────────────
  doc.setFillColor(...colors.headerBg);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textLight);
  doc.text('DADOS DO CLIENTE', margin + 4, y + 5.5);
  y += 10;

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;

  // Client name
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textLight);
  doc.text('CLIENTE', col1, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(budget.clientName || '-', col1, y + 5);

  // Address block (col1 continued)
  let addrLine = '';
  if (budget.clientAddress) addrLine += budget.clientAddress;
  if (budget.clientNeighborhood) addrLine += (addrLine ? ' — ' : '') + budget.clientNeighborhood;
  const cityState = [budget.clientCity, budget.clientState].filter(Boolean).join(' / ');

  let addrY = y + 5;
  if (addrLine) {
    addrY += 4;
    doc.setFontSize(8);
    doc.setTextColor(...colors.textLight);
    doc.text(addrLine.substring(0, 55), col1, addrY);
  }
  if (cityState) {
    addrY += 4;
    doc.text(cityState, col1, addrY);
  }

  // Architect (col2) — only if provided
  if (budget.architectName && budget.architectName.trim()) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textLight);
    doc.text('ARQUITETA(O)', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text(budget.architectName, col2, y + 5);
  }

  // Delivery + Payment (col2 lower)
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textLight);
  doc.text('PRAZO DE ENTREGA', col2, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(`${budget.deliveryDays} dias úteis`, col2, y + 17);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textLight);
  doc.text('FORMA DE PAGAMENTO', col1, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text((budget.paymentTerms || '-').substring(0, 55), col1, y + 17);

  y = Math.max(addrY, y + 20) + 8;

  // Divider
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Rooms & Items ────────────────────────────────────────────────────────
  for (const room of budget.rooms) {
    const subtotal = calculateRoomSubtotal(room);
    // Estimate height: room header (16) + table header (10) + each item (variable)
    checkPage(28);

    // Room header
    doc.setFillColor(...colors.headerBg);
    doc.setDrawColor(...colors.border);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    doc.text(room.name.toUpperCase(), margin + 4, y + 5.5);
    doc.text(formatCurrency(subtotal), pageWidth - margin - 4, y + 5.5, { align: 'right' });
    y += 10;

    // Table header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textLight);
    doc.text('DESCRIÇÃO DO ITEM', margin + 4, y + 3);
    doc.text('MEDIDAS', margin + 95, y + 3);
    doc.text('VALOR', pageWidth - margin - 4, y + 3, { align: 'right' });
    y += 7;
    doc.setDrawColor(...colors.border);
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;

    // Items
    for (const item of room.items) {
      checkPage(14);

      // Item name
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(item.name, margin + 4, y + 4);

      // Measurements
      doc.setFontSize(8);
      doc.setTextColor(...colors.textLight);
      doc.text(item.measurements || '-', margin + 95, y + 4);

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...colors.text);
      doc.text(formatCurrency(item.value), pageWidth - margin - 4, y + 4, { align: 'right' });

      y += 7;

      // Observations — full text, wrapped
      if (item.observations && item.observations.trim()) {
        const obsLines = doc.splitTextToSize(item.observations.trim(), contentWidth - 8);
        for (const line of obsLines) {
          checkPage(5);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...colors.textLight);
          doc.text(line, margin + 4, y + 3);
          y += 4.5;
        }
        y += 1;
      }

      // Row divider
      doc.setDrawColor(...colors.border);
      doc.line(margin, y, pageWidth - margin, y);
      y += 2;
    }

    y += 5;
  }

  // ── General Observations ─────────────────────────────────────────────────
  if (budget.generalObservations && budget.generalObservations.trim()) {
    checkPage(20);
    y += 2;
    doc.setFillColor(...colors.headerBg);
    doc.setDrawColor(...colors.border);
    doc.rect(margin, y, contentWidth, 7, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textLight);
    doc.text('OBSERVAÇÕES GERAIS', margin + 4, y + 4.8);
    y += 9;

    const obsLines = doc.splitTextToSize(budget.generalObservations.trim(), contentWidth - 8);
    for (const line of obsLines) {
      checkPage(5);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.text(line, margin + 4, y + 4);
      y += 5;
    }
    y += 4;
  }

  // ── Total ────────────────────────────────────────────────────────────────
  checkPage(20);
  y += 2;
  doc.setDrawColor(...colors.border);
  doc.rect(margin, y, contentWidth, 12, 'S');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text('TOTAL DO PROJETO', margin + 4, y + 8);

  const displayTotal = budget.customTotal ?? calculateBudgetTotal(budget);
  doc.setFontSize(13);
  doc.text(formatCurrency(displayTotal), pageWidth - margin - 4, y + 8, { align: 'right' });
  y += 16;

  // Payment terms (full text)
  if (budget.paymentTerms) {
    checkPage(14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textLight);
    doc.text('CONDIÇÕES DE PAGAMENTO', margin, y);
    y += 5;
    const lines = doc.splitTextToSize(budget.paymentTerms, contentWidth);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const footerY = 287;
  doc.setDrawColor(...colors.border);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text('Marcenaria Quality', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textLight);
  doc.text('CNPJ: 63.111.412/0001-19  •  Pablo Santos  •  (11) 91639-5199', margin, footerY + 4);

  const fileName = `Orcamento_${budget.clientName?.replace(/\s+/g, '_') || 'novo'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
