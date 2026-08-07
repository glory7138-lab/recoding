const fs = require('fs');

async function translateText(text) {
  if (!text) return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    return text;
  }
}

async function main() {
  const jsonPath = './public/intern_output.json';
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const items = JSON.parse(raw);

  console.log(`Translating ${items.length} items with Node.js...`);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.translation || item.translation === '') {
      item.translation = await translateText(item.text);
      if ((i + 1) % 10 === 0 || i === items.length - 1) {
        console.log(`Progress: ${i + 1}/${items.length}`);
      }
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf-8');
  fs.writeFileSync('./auto-segmenter/intern_output.json', JSON.stringify(items, null, 2), 'utf-8');
  console.log('NODE TRANSLATION DONE SUCCESSFULLY!');
}

main();
