import argparse
import json
import whisperx
import gc
import os
import sys
import time

# Ensure local ffmpeg is in PATH
current_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["PATH"] = current_dir + os.pathsep + os.environ["PATH"]

def process_audio(file_path, language="en", output_json="output.json"):
    # 0. Setup
    # device = "cuda" if torch.cuda.is_available() else "cpu"
    # Using cpu by default for broad compatibility, but CUDA is highly recommended for production
    device = "cpu"
    try:
        import torch
        if torch.cuda.is_available():
            device = "cuda"
    except ImportError:
        pass

    batch_size = 8 # Reduce if low on VRAM
    compute_type = "float16" if device == "cuda" else "int8" 
    print(f"[{time.strftime('%H:%M:%S')}] Starting WhisperX processing on {device}...")

    # 1. Load audio
    print(f"[{time.strftime('%H:%M:%S')}] Loading audio file: {file_path}")
    audio = whisperx.load_audio(file_path)

    # 2. Transcribe
    print(f"[{time.strftime('%H:%M:%S')}] Loading transcription model (large-v2)...")
    model = whisperx.load_model("large-v2", device, compute_type=compute_type)
    
    print(f"[{time.strftime('%H:%M:%S')}] Transcribing with VAD...")
    result = model.transcribe(audio, batch_size=batch_size, language=language)
    
    # Free VRAM
    del model
    gc.collect()
    try:
        if device == "cuda":
            torch.cuda.empty_cache()
    except NameError:
        pass

    # 3. Align
    print(f"[{time.strftime('%H:%M:%S')}] Loading alignment model for {language}...")
    model_a, metadata = whisperx.load_align_model(language_code=language, device=device)
    
    print(f"[{time.strftime('%H:%M:%S')}] Running forced alignment...")
    aligned_result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    # Free VRAM
    del model_a
    gc.collect()
    try:
        if device == "cuda":
            torch.cuda.empty_cache()
    except NameError:
        pass

    # 4. Convert to NativeBOX format
    print(f"[{time.strftime('%H:%M:%S')}] Converting to NativeBOX JSON format...")
    nativebox_segments = []
    for idx, segment in enumerate(aligned_result["segments"]):
        # Fallback if alignment somehow missed the exact timestamps
        start_time = segment.get("start", 0.0)
        end_time = segment.get("end", 0.0)
        
        nativebox_segments.append({
            "id": idx + 1,
            "start": round(start_time, 3),
            "end": round(end_time, 3),
            "text": segment["text"].strip(),
            "translation": "" # Placeholder for translation
        })

    # Save to file
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(nativebox_segments, f, indent=2, ensure_ascii=False)
        
    print(f"[{time.strftime('%H:%M:%S')}] Done! Result saved to {output_json}")
    return nativebox_segments

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Auto-Segmenter PoC using WhisperX")
    parser.add_argument("file_path", help="Path to the audio or video file")
    parser.add_argument("--lang", default="en", help="Language code (default: en)")
    parser.add_argument("--out", default="output.json", help="Output JSON file path")
    args = parser.parse_args()
    
    if not os.path.exists(args.file_path):
        print(f"Error: File not found -> {args.file_path}")
        exit(1)
        
    process_audio(args.file_path, language=args.lang, output_json=args.out)
