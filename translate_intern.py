import json
import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def translate_text(text):
    if not text:
        return ""
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q={urllib.parse.quote(text)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            res = response.read().decode('utf-8')
            data = json.loads(res)
            translated = "".join([sentence[0] for sentence in data[0] if sentence and len(sentence) > 0 and sentence[0]])
            return translated
    except Exception as e:
        print(f"Err: {e}")
        return ""

def main():
    json_path = r"public/intern_output.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    print(f"Translating {len(items)} items...")
    count = 0
    for idx, item in enumerate(items):
        if not item.get('translation'):
            eng = item.get('text', '')
            item['translation'] = translate_text(eng)
            count += 1
            if count % 10 == 0:
                print(f"Translated {count}/{len(items)}...")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    with open(r"auto-segmenter/intern_output.json", 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print("ALL DONE!")

if __name__ == '__main__':
    main()
