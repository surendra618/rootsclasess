import puppeteer from 'puppeteer';
import fs from 'fs';

const htmlFile = 'C:/Users/difmo/.gemini/antigravity-ide/brain/d07ba6c0-ef3b-4956-a831-05a4c37b5ed7/project_showcase.html';
const outputDir = 'D:/Rootclasses/Root_classes';
const outputPdfWorkspace = `${outputDir}/RootClasses_Project_Overview.pdf`;
const outputPdfDesktop = 'C:/Users/difmo/Desktop/RootClasses_Project_Overview.pdf';

(async () => {
  console.log('🚀 PDF generation shuru ho rahi hai...');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  console.log('📄 HTML file load ho rahi hai...');
  await page.goto(`file:///${htmlFile}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Fonts & styles settle hone ka wait
  await new Promise(r => setTimeout(r, 2000));

  console.log('🖨️ PDF print ho rahi hai...');
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  // Write to workspace
  fs.writeFileSync(outputPdfWorkspace, pdfBuffer);
  console.log('✅ Workspace me save ho gaya:', outputPdfWorkspace);

  // Write to desktop for easy sharing
  try {
    fs.writeFileSync(outputPdfDesktop, pdfBuffer);
    console.log('✅ Desktop pe save ho gaya:', outputPdfDesktop);
  } catch (err) {
    console.log('Desktop write note:', err.message);
  }

  await browser.close();
  console.log('🎉 Done! PDF bilkul ready hai.');
})();
