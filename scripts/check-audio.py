"""Transcribe narration clips with local whisper.cpp (free) and compare them with their text.

Usage: python3 scripts/check-audio.py [id1,id2,...]
Lowest scores first. One-word clips often score low only because whisper adds or drops a
letter: listen to those rather than re-recording. No cloud transcription is used.
"""
import concurrent.futures as cf, difflib, json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.expanduser('~/.cache/whisper-cpp/ggml-large-v3-turbo.bin')
CLIPS = json.load(open(os.path.join(ROOT, 'public', 'audio', 'manifest.json'), encoding='utf-8'))['clips']


def norm(text):
    text = re.sub('[ً-ْٰـ]', '', text)
    text = re.sub('[إأآ]', 'ا', text).replace('ى', 'ي').replace('ة', 'ه')
    text = re.sub(r'[^\w\s]', ' ', text)
    return ' '.join(text.split())


def check(cid):
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(ROOT, 'public', 'audio', cid + '.mp3'), '-ar', '16000', '-ac', '1', wav], check=True)
        heard = ' '.join(subprocess.run(['whisper-cli', '-m', MODEL, '-l', 'ar', '-nt', '-np', '-f', wav], capture_output=True, text=True).stdout.split())
    want = CLIPS[cid]['text']
    return cid, want, heard, difflib.SequenceMatcher(None, norm(want), norm(heard)).ratio()


def main():
    ids = sys.argv[1].split(',') if len(sys.argv) > 1 else sorted(CLIPS)
    with cf.ThreadPoolExecutor(max_workers=3) as pool:
        rows = sorted(pool.map(check, ids), key=lambda row: row[3])
    for cid, want, heard, score in rows:
        print(f'{score:.2f}  {cid}\n      want: {want}\n      got:  {heard}')


if __name__ == '__main__':
    main()
