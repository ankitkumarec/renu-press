#!/usr/bin/env python3
"""Optional PaddleOCR CLI for RENU PRESS Support Gateway.
Usage: python paddle_ocr.py <image_path>
Prints extracted text to stdout.
Install: pip install paddlepaddle paddleocr
"""
import sys

def main():
    if len(sys.argv) < 2:
        print("", end="")
        return 0
    path = sys.argv[1]
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        result = ocr.ocr(path, cls=True)
        lines = []
        if result:
            for block in result:
                if not block:
                    continue
                for line in block:
                    if line and len(line) > 1 and line[1]:
                        lines.append(str(line[1][0]))
        print("\n".join(lines))
        return 0
    except Exception as e:
        print(f"", end="")
        sys.stderr.write(str(e) + "\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
