import { expect, test } from '@playwright/test';

const buildPdf = () => {
  const content = 'BT /F1 18 Tf 40 120 Td (PDF2JPG) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`,
  ];

  const offsets = [0];
  let body = '%PDF-1.4\n';
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, 'ascii'));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(body, 'ascii');
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += `startxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(body, 'ascii');
};

test('converts batch PDFs with empty MIME type and exposes JPG and ZIP downloads', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Output base name').fill('client-report');
  await page.getByLabel('Page range').check();
  await page.getByLabel('Start page').fill('1');
  await page.getByLabel('End page').fill('1');

  await page.locator('input[type="file"]').setInputFiles([
    {
      name: 'sample-one.pdf',
      mimeType: '',
      buffer: buildPdf(),
    },
    {
      name: 'sample-two.pdf',
      mimeType: '',
      buffer: buildPdf(),
    },
  ]);

  await expect(page.getByText('Conversion Finished')).toBeVisible();
  await expect(page.getByText('sample-one.pdf')).toBeVisible();
  await expect(page.getByText('sample-two.pdf')).toBeVisible();
  await expect(page.getByText('Output base: client-report-sample-one')).toBeVisible();
  await expect(page.getByText('Output base: client-report-sample-two')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download JPG' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeEnabled();
});
