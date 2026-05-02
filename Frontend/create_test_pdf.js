const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument();
const filePath = path.join(__dirname, '..', 'test_sample.pdf');
const stream = fs.createWriteStream(filePath);

doc.pipe(stream);

// Add content to PDF
doc.fontSize(20).text('React Hooks Study Guide', 100, 100);
doc.moveDown();

doc.fontSize(14).text('1. Introduction to Hooks', { underline: true });
doc.fontSize(12).text('Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8.');
doc.moveDown();

doc.fontSize(14).text('2. useState Hook', { underline: true });
doc.fontSize(12).text('The useState hook allows you to add state to functional components. It returns an array with two elements: the state value and a function to update it.');
doc.moveDown();

doc.fontSize(14).text('3. useEffect Hook', { underline: true });
doc.fontSize(12).text('useEffect performs side effects in functional components. It runs after every render by default. You can specify dependencies to control when it runs.');
doc.moveDown();

doc.fontSize(14).text('4. Custom Hooks', { underline: true });
doc.fontSize(12).text('Custom hooks are functions that use other hooks. They allow you to reuse stateful logic between components. Names should start with "use".');
doc.moveDown();

doc.fontSize(14).text('5. Rules of Hooks', { underline: true });
doc.fontSize(12).text('- Only call hooks at the top level\n- Never call hooks inside loops, conditions, or nested functions\n- Only call hooks from React function components');

doc.end();

stream.on('finish', () => {
  console.log('Test PDF created:', filePath);
});
