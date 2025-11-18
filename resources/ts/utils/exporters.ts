import { toPng } from 'html-to-image';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { HydraulicsResult } from '../physics/engine';
import type { SystemModel } from '../model/schema';
import {
  HEAD_UNIT,
  PRESSURE_UNIT,
  SPECIFIC_WEIGHT_UNIT,
  formatNumber,
  toDisplayLength,
  toDisplayPressure,
  toDisplaySpecificWeight,
} from './units';

const ensurePdfFonts = (): void => {
  const fonts = (pdfFonts as unknown as { pdfMake?: { vfs?: typeof pdfMake.vfs } }).pdfMake?.vfs;
  if (fonts && !(pdfMake as { vfs?: typeof fonts }).vfs) {
    (pdfMake as unknown as { vfs: typeof fonts }).vfs = fonts;
  }
};

export const exportDiagramPng = async (element: HTMLElement, fileName = 'esquema-hidraulico.png'): Promise<void> => {
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    backgroundColor: '#020617',
  });

  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
};

export const exportDiagramSvg = (model: SystemModel, fileName = 'esquema-hidraulico.svg'): void => {
  const padding = 40;
  if (model.nodes.length === 0) return;
  const minX = Math.min(...model.nodes.map((n) => n.position.x));
  const minY = Math.min(...model.nodes.map((n) => n.position.y));
  const maxX = Math.max(...model.nodes.map((n) => n.position.x));
  const maxY = Math.max(...model.nodes.map((n) => n.position.y));
  const width = Math.ceil(maxX - minX + padding * 2);
  const height = Math.ceil(maxY - minY + padding * 2);

  const translateX = padding - minX;
  const translateY = padding - minY;

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const pipeSvg = model.pipes
    .map((p) => {
      const a = model.nodes.find((n) => n.id === p.from);
      const b = model.nodes.find((n) => n.id === p.to);
      if (!a || !b) return '';
      return `<g stroke="#94a3b8" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="${a.position.x}" y1="${a.position.y}" x2="${b.position.x}" y2="${b.position.y}" />
      </g>`;
    })
    .join('');

  const nodeSvg = model.nodes
    .map((n) => {
      if (n.kind === 'tank') {
        // @ts-ignore dimensions exist in tank
        const { width: w, height: h } = n.dimensions;
        return `<g>
          <rect x="${n.position.x - w / 2}" y="${n.position.y - h / 2}" width="${w}" height="${h}" rx="14"
            fill="rgba(56,189,248,0.15)" stroke="#475569" stroke-width="2" />
          <text x="${n.position.x}" y="${n.position.y - h / 2 - 8}" text-anchor="middle" font-size="12" fill="#e2e8f0">${esc(
            n.name,
          )}</text>
        </g>`;
      }
      if (n.kind === 'junction') {
        return `<g>
          <circle cx="${n.position.x}" cy="${n.position.y}" r="18" fill="#0f172a" stroke="#1d4ed8" stroke-width="2" />
          <text x="${n.position.x}" y="${n.position.y + 34}" text-anchor="middle" font-size="12" fill="#cbd5e1">${esc(
            n.name,
          )}</text>
        </g>`;
      }
      if (n.kind === 'pump') {
        return `<g>
          <circle cx="${n.position.x}" cy="${n.position.y}" r="20" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />
          <text x="${n.position.x}" y="${n.position.y - 28}" text-anchor="middle" font-size="12" fill="#cbd5e1">${esc(
            n.name,
          )}</text>
        </g>`;
      }
      return '';
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      text { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; }
    </style>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#0b1220" />
  <g transform="translate(${translateX}, ${translateY})">
    ${pipeSvg}
    ${nodeSvg}
  </g>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const fetchAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const exportReportPdf = async (
  model: SystemModel,
  results: HydraulicsResult,
  options?: { logoUrl?: string },
): Promise<void> => {
  ensurePdfFonts();
  const headUnit = HEAD_UNIT[model.units];
  const pressureUnit = PRESSURE_UNIT[model.units];
  const logoDataUrl = options?.logoUrl ? await fetchAsDataUrl(options.logoUrl) : null;

  const nodeTableBody = [
    ['Nodo', 'Tipo', `X (m)`, `Y (m)`],
    ...model.nodes.map((n) => [
      n.name,
      n.kind,
      formatNumber(toDisplayLength(n.position.x / 40, model.units), 2),
      formatNumber(toDisplayLength(n.position.y / 40, model.units), 2),
    ]),
  ];

  const pipeTableBody = [
    ['Tubería', 'Desde → Hacia', `D (${HEAD_UNIT[model.units]})`, `L (${HEAD_UNIT[model.units]})`, 'k'],
    ...model.pipes.map((p) => {
      const from = model.nodes.find((n) => n.id === p.from)?.name ?? p.from;
      const to = model.nodes.find((n) => n.id === p.to)?.name ?? p.to;
      return [
        p.name,
        `${from} → ${to}`,
        formatNumber(toDisplayLength(p.diameter, model.units), 3),
        formatNumber(toDisplayLength(p.length, model.units), 2),
        formatNumber(p.minorLossK, 2),
      ];
    }),
  ];

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        columns: [
          { image: logoDataUrl ?? undefined, width: 80, margin: [0, -6, 12, 0] },
          { text: 'Reporte hidráulico', style: 'title', alignment: 'right' },
        ],
      },
      {
        text: `Fluido: ${results.fluidName} | Sistema: ${model.units}`,
        margin: [0, 10, 0, 20],
        style: 'subtitle',
      },
      {
        style: 'tableExample',
        table: {
          widths: ['*', '*', '*'],
          body: [
            ['Magnitud', 'Valor', 'Unidades'],
            ['TDH', `${formatNumber(toDisplayLength(results.totalDynamicHead, model.units), 2)}`, headUnit],
            ['Altura bomba', `${formatNumber(toDisplayLength(results.pumpAddedHead, model.units), 2)}`, headUnit],
            ['Balance', `${formatNumber(toDisplayLength(results.energyBalance, model.units), 2)}`, headUnit],
            ['NPSHa', `${formatNumber(results.npsha, 2)}`, headUnit],
            [
              'P. succión',
              `${formatNumber(toDisplayPressure(results.suctionPressure, model.units), 1)}`,
              pressureUnit,
            ],
            [
              'P. descarga',
              `${formatNumber(toDisplayPressure(results.dischargePressure, model.units), 1)}`,
              pressureUnit,
            ],
          ],
        },
        layout: 'lightHorizontalLines',
      },
      {
        text: 'Manómetro virtual',
        style: 'subtitle',
        margin: [0, 20, 0, 8],
      },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              'Punto',
              `Altura (${headUnit})`,
              `P absoluta (${pressureUnit})`,
              `P relativa (${pressureUnit})`,
            ],
            ...results.nodeSummaries.map((summary) => [
              summary.label,
              formatNumber(toDisplayLength(summary.elevation, model.units), 2),
              formatNumber(toDisplayPressure(summary.absolutePressure, model.units), 1),
              formatNumber(toDisplayPressure(summary.gaugePressure, model.units), 1),
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },
      { text: 'Nodos', style: 'subtitle', margin: [0, 18, 0, 6] },
      { table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto'], body: nodeTableBody }, layout: 'lightHorizontalLines' },
      { text: 'Tuberías', style: 'subtitle', margin: [0, 18, 0, 6] },
      { table: { headerRows: 1, widths: ['*', '*', 'auto', 'auto', 'auto'], body: pipeTableBody }, layout: 'lightHorizontalLines' },
      {
        text: 'Las presiones reproducen P = γ·h y los balances de Pascal, listas para cotejar con manuales académicos.',
        style: 'paragraph',
        margin: [0, 12, 0, 12],
      },
      {
        text: 'Alertas de ingeniería',
        style: 'subtitle',
        margin: [0, 12, 0, 8],
      },
      ...(results.energyBalance < 0
        ? [{ text: '• Altura insuficiente para vencer pérdidas totales.', style: 'paragraph' }]
        : []),
    ],
    styles: {
      title: {
        fontSize: 20,
        bold: true,
        color: '#0f172a',
      },
      subtitle: {
        fontSize: 12,
        color: '#334155',
      },
      paragraph: {
        fontSize: 11,
        color: '#0f172a',
      },
    },
  } as const;

  pdfMake.createPdf(docDefinition).download('reporte-hidraulico.pdf');
};

export const exportReportHtml = (model: SystemModel, results: HydraulicsResult): void => {
  const headUnit = HEAD_UNIT[model.units];
  const pressureUnit = PRESSURE_UNIT[model.units];
  const specificWeightUnit = SPECIFIC_WEIGHT_UNIT[model.units];

  const nodeRows = results.nodeSummaries
    .map(
      (summary) => `
        <tr>
          <td>${summary.label}</td>
          <td>${formatNumber(toDisplayLength(summary.elevation, model.units), 2)}</td>
          <td>${formatNumber(toDisplayPressure(summary.absolutePressure, model.units), 1)}</td>
          <td>${formatNumber(toDisplayPressure(summary.gaugePressure, model.units), 1)}</td>
          <td>${summary.explanation}</td>
        </tr>
      `,
    )
    .join('');

  const html = `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Reporte hidráulico</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 32px; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin: 24px 0 12px; color: #38bdf8; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid rgba(148, 163, 184, 0.4); padding: 8px 10px; text-align: left; }
          th { background: rgba(14, 116, 144, 0.25); }
          tbody tr:nth-child(odd) { background: rgba(30, 41, 59, 0.5); }
          p { margin: 0 0 12px; line-height: 1.6; }
          .panel { background: rgba(15, 23, 42, 0.85); border-radius: 16px; padding: 24px; box-shadow: 0 20px 60px rgba(8, 47, 73, 0.35); }
        </style>
      </head>
      <body>
        <div class="panel">
          <h1>Reporte hidráulico</h1>
          <p><strong>Fluido:</strong> ${results.fluidName} · <strong>Sistema:</strong> ${model.units}</p>
          <p><strong>Densidad:</strong> ${formatNumber(results.fluidDensity, 1)} kg/m³ · <strong>γ:</strong> ${formatNumber(
            toDisplaySpecificWeight(results.specificWeight, model.units),
            1,
          )} ${specificWeightUnit}</p>
          <h2>Balance energético</h2>
          <table>
            <thead>
              <tr>
                <th>Magnitud</th>
                <th>Valor</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>TDH</td><td>${formatNumber(toDisplayLength(results.totalDynamicHead, model.units), 2)}</td><td>${headUnit}</td></tr>
              <tr><td>Altura bomba</td><td>${formatNumber(toDisplayLength(results.pumpAddedHead, model.units), 2)}</td><td>${headUnit}</td></tr>
              <tr><td>Balance</td><td>${formatNumber(toDisplayLength(results.energyBalance, model.units), 2)}</td><td>${headUnit}</td></tr>
              <tr><td>NPSHa</td><td>${formatNumber(results.npsha, 2)}</td><td>${headUnit}</td></tr>
              <tr><td>P. succión</td><td>${formatNumber(toDisplayPressure(results.suctionPressure, model.units), 1)}</td><td>${pressureUnit}</td></tr>
              <tr><td>P. descarga</td><td>${formatNumber(toDisplayPressure(results.dischargePressure, model.units), 1)}</td><td>${pressureUnit}</td></tr>
            </tbody>
          </table>
          <h2>Manómetro virtual</h2>
          <p>Desglose ordenado de cada punto clave con alturas y presiones absolutas/relativas, listo para cotejar con guías de aula.</p>
          <table>
            <thead>
              <tr>
                <th>Punto</th>
                <th>Altura (${headUnit})</th>
                <th>P absoluta (${pressureUnit})</th>
                <th>P relativa (${pressureUnit})</th>
                <th>Explicación</th>
              </tr>
            </thead>
            <tbody>
              ${nodeRows}
            </tbody>
          </table>
        </div>
      </body>
    </html>`;

  const reportWindow = window.open('', '_blank', 'noopener');
  if (reportWindow) {
    reportWindow.document.write(html);
    reportWindow.document.close();
  }
};
