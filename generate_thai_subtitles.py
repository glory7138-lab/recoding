import sys
import os
import json
import urllib.request
import urllib.parse
import time
import subprocess

def translate_mymemory(text, source_lang, target_lang):
    if not text or not text.strip():
        return text
    lang_pair = f"{source_lang}|{target_lang}"
    url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={lang_pair}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('responseStatus') == 200:
                res = data.get('responseData', {}).get('translatedText', text)
                if res and not res.startswith("MYMEMORY WARNING"):
                    return res
    except Exception as e:
        print(f"Translation err ({source_lang}->{target_lang}): {e}")
    return text

def main():
    video_path = r"c:\DEV\recoding\media\ATM Er Rak Error.mp4"
    output_json = r"c:\DEV\recoding\media\ATM Er Rak Error.json"
    
    print("--- 1. Running Whisper for Thai Speech Recognition ---")
    script = f"""
import whisper
import json

model = whisper.load_model("small")
result = model.transcribe(r"{video_path}", language="th", task="transcribe")

segments = []
for i, seg in enumerate(result.get("segments", [])):
    segments.append({{
        "id": i + 1,
        "start": round(seg["start"], 3),
        "end": round(seg["end"], 3),
        "text": seg["text"].strip()
    }})

with open(r"c:\DEV\recoding\scratch_raw_th.json", "w", encoding="utf-8") as f:
    json.dump(segments, f, ensure_ascii=False, indent=2)
print(f"Extracted {{len(segments)}} segments.")
"""
    
    with open("scratch_run_whisper.py", "w", encoding="utf-8") as f:
        f.write(script)
        
    cmd = [r"auto-segmenter\venv\Scripts\python.exe", "scratch_run_whisper.py"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)

    raw_file = r"c:\DEV\recoding\scratch_raw_th.json"
    if not os.path.exists(raw_file):
        print("Failed to generate whisper output.")
        return

    with open(raw_file, "r", encoding="utf-8") as f:
        raw_segments = json.load(f)

    print(f"--- 2. Pivot Translation: Thai -> English -> Korean for {len(raw_segments)} segments ---")
    final_segments = []
    
    for item in raw_segments:
        th_text = item["text"]
        if not th_text:
            continue
            
        # Thai -> English
        en_text = translate_mymemory(th_text, "th", "en")
        time.sleep(0.3)
        
        # English -> Korean
        ko_text = translate_mymemory(en_text, "en", "ko")
        time.sleep(0.3)
        
        print(f"[{item['id']}] TH: {th_text} | EN: {en_text} | KO: {ko_text}")
        
        final_segments.append({
            "id": item["id"],
            "start": item["start"],
            "end": item["end"],
            "text": th_text,
            "translation": ko_text,
            "english": en_text
        })

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(final_segments, f, ensure_ascii=False, indent=2)

    print(f"SUCCESS: Saved {len(final_segments)} segments to {output_json}")

if __name__ == "__main__":
    main()
