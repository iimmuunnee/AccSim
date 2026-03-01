#!/usr/bin/env python3
"""AccSim 웹 뮤지엄 통합 실행 스크립트.

프로젝트 루트에서 한 줄로 백엔드(FastAPI)와 프론트엔드(Next.js)를 동시에 실행합니다.
Ctrl+C로 둘 다 한 번에 종료됩니다.

Usage:
    python start_web.py
"""

import subprocess
import sys
import signal
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "accsim" / "web"
FRONTEND_DIR = BACKEND_DIR / "frontend"

processes: list[subprocess.Popen] = []


def cleanup(signum=None, frame=None):
    """모든 자식 프로세스를 종료합니다."""
    for proc in processes:
        if proc.poll() is None:
            proc.terminate()
    for proc in processes:
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
    sys.exit(0)


def ensure_node_modules():
    """node_modules가 없으면 npm install을 실행합니다."""
    if not (FRONTEND_DIR / "node_modules").exists():
        print("[AccSim] node_modules not found — running npm install...")
        result = subprocess.run(
            ["npm", "install"],
            cwd=FRONTEND_DIR,
            shell=(os.name == "nt"),
        )
        if result.returncode != 0:
            print("[AccSim] npm install failed.", file=sys.stderr)
            sys.exit(1)
        print("[AccSim] npm install complete.\n")


def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # npm install 자동 감지
    ensure_node_modules()

    print("[AccSim] Starting backend  → http://localhost:8080")
    print("[AccSim] Starting frontend → http://localhost:3000")
    print("[AccSim] Press Ctrl+C to stop both.\n")

    use_shell = os.name == "nt"

    # 백엔드: uvicorn (프로젝트 루트에서 모듈 경로로 실행 — 상대 임포트 지원)
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "accsim.web.app:app", "--port", "8080"],
        cwd=ROOT,
        shell=use_shell,
    )
    processes.append(backend)

    # 프론트엔드: npm run dev
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=use_shell,
    )
    processes.append(frontend)

    # 둘 중 하나라도 종료되면 나머지도 정리
    try:
        while True:
            for proc in processes:
                ret = proc.poll()
                if ret is not None:
                    name = "Backend" if proc is backend else "Frontend"
                    print(f"\n[AccSim] {name} exited (code {ret}). Shutting down...")
                    cleanup()
            # busy-wait 방지
            try:
                backend.wait(timeout=1)
            except subprocess.TimeoutExpired:
                pass
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()
