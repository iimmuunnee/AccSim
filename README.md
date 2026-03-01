# AccSim — AI 가속기 시뮬레이터

> Systolic Array 기반 행렬 연산 가속기의 **사이클 정확도(cycle-accurate) 시뮬레이터**입니다.
> 실제 AI 모델(LSTM)을 가상 하드웨어 위에서 돌려보고, 성능을 분석합니다.

---

## AI는 똑똑해졌는데, 컴퓨터가 못 따라간다

ChatGPT에게 질문을 던지면 몇 초 안에 답이 돌아옵니다. 자율주행 차는 1초에 수십 번 주변 상황을 판단합니다. 넷플릭스는 수억 명의 취향을 실시간으로 분석해 영화를 추천합니다.

이 모든 것의 뒤에는 **거대한 AI 모델**이 있습니다. 그리고 이 모델들은 해마다 몇 배씩 더 커지고 있습니다.

**문제는, 기존 컴퓨터가 이 속도를 감당하지 못한다는 것입니다.**

우리가 쓰는 CPU는 원래 이메일, 웹서핑, 문서 작업 같은 범용 작업을 위해 만들어졌습니다. GPU는 게임 그래픽을 위해 태어났고, AI 연산에 꽤 잘 맞아서 지금까지 버텨왔습니다. 하지만 AI 모델이 수천억 개의 숫자를 곱하고 더하는 수준에 이르자, GPU조차 전력을 너무 많이 먹고, 속도도 부족해지기 시작했습니다.

> 범용 도구로는 더 이상 전문적인 일을 감당할 수 없는 시점이 온 것입니다.

---

## 그래서 등장한 것이 "AI 전용 칩"이다

해결책은 단순합니다. **AI 연산만 하는 전용 칩**을 만드는 것입니다.

일반 컴퓨터가 "무엇이든 할 수 있는 만능 칼"이라면, AI 전용 칩은 **"회를 뜨기 위해 만든 사시미 칼"** 같은 존재입니다. 할 수 있는 일은 제한되지만, 그 한 가지를 압도적으로 잘합니다.

실제로 이런 칩들이 이미 세상에 나와 있습니다:
- **Google TPU** — 데이터센터에서 AI 모델을 훈련시키는 전용 칩
- **Tesla FSD Chip** — 자율주행 판단을 차 안에서 실시간으로 처리하는 칩
- **Tesla Dojo** — 자율주행 학습 데이터를 대규모로 처리하는 슈퍼컴퓨터 칩

이 칩들의 핵심에는 **Systolic Array**라는 구조가 있습니다. 수백 개의 작은 연산 유닛이 바둑판처럼 나란히 앉아서, 데이터를 옆으로, 아래로 흘려보내며 동시에 계산하는 방식입니다. 마치 공장의 조립 라인에서 부품이 컨베이어 벨트를 타고 흐르듯, 숫자들이 칩 안을 흘러가며 연산이 완성됩니다.

> AI 전용 칩은 "AI의 곱셈과 덧셈"만을 위해 태어난 초특화 하드웨어입니다.

---

## 그런데, 칩을 만들기 전에 먼저 해볼 방법은 없을까?

여기서 현실적인 문제가 생깁니다. **반도체 칩을 하나 만드는 데는 수백억 원이 듭니다.**

설계를 잘못하면 돈과 시간이 그대로 날아갑니다. 수정하려면 처음부터 다시 만들어야 합니다. 그래서 실제 칩을 찍어내기 전에 반드시 거쳐야 하는 단계가 있습니다.

**시뮬레이션입니다.**

건축가가 건물을 짓기 전에 3D 모델링으로 구조를 검증하고, 자동차 회사가 신차를 출시하기 전에 풍동 시뮬레이션으로 공기저항을 테스트하는 것과 같습니다. 실제로 만들기 전에, 컴퓨터 안에서 가상으로 먼저 돌려보는 것입니다.

AI 가속기도 마찬가지입니다. 칩 안에서 데이터가 어떻게 흐르는지, 연산 유닛이 얼마나 효율적으로 일하는지, 병목은 어디서 생기는지 — 이 모든 것을 **실제 칩 없이 소프트웨어로 먼저 확인**할 수 있어야 합니다.

> 수백억짜리 칩을 깎기 전에, 소프트웨어로 먼저 "리허설"을 하는 것입니다.

---

## AccSim은 바로 그 리허설 도구입니다

**AccSim은 가상의 AI 가속기를 소프트웨어로 만들고, 그 위에서 실제 AI 모델을 돌려보는 시뮬레이터입니다.**

단순히 "결과가 맞는지"만 확인하는 것이 아닙니다. 칩 내부의 매 클럭 사이클마다 — 즉 10억 분의 1초 단위로 — 데이터가 어디에 있고, 어떤 연산 유닛이 일하고 있고, 어디서 시간이 낭비되는지를 정밀하게 추적합니다.

그리고 실제 프로젝트에서 쓰이는 AI 모델(태양광 발전량 예측 모델)을 이 가상 칩 위에 올려, 진짜 하드웨어에서 돌리는 것과 동일한 과정을 재현합니다.

> 한 문장으로 요약하면: **"실제 칩 없이, 칩이 있는 것처럼 AI를 돌려보고 성능까지 분석하는 도구"** 입니다.

---

## 이 프로젝트가 뭔가요?

AccSim은 **AI 가속기**(딥러닝 행렬 연산에 특화된 전용 프로세서)의 **사이클 정확 시뮬레이터**(cycle-accurate simulator, 매 클럭 사이클을 1:1로 추적하는 시뮬레이션)입니다:

- **Systolic Array**(PE를 2D 격자로 배열하여 데이터를 흘리며 병렬 연산하는 구조)를 Python으로 구현
- 매 클럭 사이클마다 데이터 흐름, 메모리 접근, 연산 유닛 상태를 정밀 추적
- 실제 AI 모델(태양광 발전량 예측 LSTM)을 이 가상 칩 위에서 추론 실행
- **인터랙티브 웹 뮤지엄**으로 시뮬레이터의 모든 것을 시각적으로 체험

## 왜 이 프로젝트를 했는가

**Tesla AI Hardware 팀** 직무 지원을 위해 만들었습니다.

Tesla는 자체 AI 칩(FSD Chip, Dojo)을 설계하며, **HW-SW Co-design**(하드웨어와 소프트웨어를 상호 제약을 고려하며 동시에 최적화하는 설계 방법론) 역량을 중시합니다. 이 프로젝트는 그 역량을 직접 시연합니다:

| 역량 | 시연 내용 |
|------|----------|
| **HW 아키텍처 이해** | Systolic Array를 사이클 단위로 구현 |
| **컴파일러/스케줄링** | 모델 → 타일링 → 명령어 스트림 변환 |
| **성능 분석** | Roofline 모델, PE 활용률, 사이클 분석 |
| **End-to-End 통합** | PyTorch 모델 → 가속기 시뮬레이션 → 결과 검증 |
| **시각화 & 커뮤니케이션** | 인터랙티브 웹 뮤지엄으로 기술을 직관적으로 전달 |

## 핵심 기능

### 1. Systolic Array 시뮬레이션
- **Weight-Stationary**(weight를 PE에 고정 배치하고 activation과 partial sum을 이동시키는 데이터 흐름 방식) NxN **Processing Element**(곱셈-누산 MAC 연산을 수행하는 단위 노드) 배열
- 매 사이클마다 activation이 좌→우, partial sum이 상→하로 흐르는 dataflow를 정확히 모델링
- **메모리 계층**(Memory Hierarchy) 시뮬레이션 — SRAM 3-buffer(weight/input/output)와 DRAM 레이턴시를 포함하여 데이터 공급 병목까지 모델링

### 2. LSTM 추론
- 태양광 발전량 예측 모델(SolarX)을 가속기 위에서 실행
- NumPy 레퍼런스 ↔ PyTorch ↔ 시뮬레이터 3자 교차 검증
- 9개 **ISA**(Instruction Set Architecture, 하드웨어가 인식하는 명령어 집합 규격) 명령어로 LSTM의 모든 연산을 표현

### 3. 성능 분석
- **Roofline 모델**(연산 강도 대비 하드웨어 한계를 시각화하여 compute-bound/memory-bound 여부를 판별하는 분석 도구) 플롯
- PE 히트맵 — **PE 활용률**(유효 MAC 수 / 전체 PE × 총 사이클)을 연산 유닛별로 시각화
- 사이클 breakdown (어디서 시간이 소모되는지)

### 4. 인터랙티브 웹 뮤지엄

AccSim의 내부를 **9개 전시관**으로 구성한 인터랙티브 웹사이트입니다.

| 전시관 | 경로 | 내용 |
|--------|------|------|
| 인트로 | `/intro` | 프로젝트 동기 & 3D 히어로 애니메이션 |
| 가속기 | `/accelerator` | Systolic Array 개념 & 데이터 흐름 |
| 칩 설계 | `/chip` | 하드웨어 스펙 & 성능 계산 |
| 시뮬레이터 | `/simulator` | AccSim 도구 개요 & 기능 |
| 실행 과정 | `/execution` | 사이클별 명령어 실행 타임라인 |
| 성능 실험실 | `/lab` | 파라미터 튜닝 & 실시간 시뮬레이션 |
| 아키텍처 | `/architecture` | 모듈 구조도 & 데이터 흐름 |
| 라이브 데모 | `/demo` | SolarX LSTM 추론 시뮬레이션 |
| 프로젝트 소개 | `/about` | 프로젝트 크레딧 & 링크 |

- **한국어/영어** 완전 지원 (`/ko/*`, `/en/*`)
- **3D 시각화** — React Three Fiber로 구현한 Systolic Array PE 격자 애니메이션
- **D3.js 차트** — Roofline 모델(log-log), PE 히트맵, 사이클 분석
- **실시간 시뮬레이션** — 어레이 크기·클럭·배치 사이즈 조절 시 즉시 결과 갱신

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                          AccSim                             │
├──────────┬──────────────┬──────────────┬────────────────────┤
│  web/    │  compiler/   │    core/     │    analysis/       │
│          │              │              │                    │
│ Next.js  │  PyTorch     │  Systolic    │  Roofline Model    │
│ Museum   │  Weight      │  Array       │  PE Heatmap        │
│ (9 Halls)│  Export      │  (NxN PEs)   │  Cycle Breakdown   │
│    ↕     │      ↓       │      ↑       │       ↑            │
│ FastAPI  │  Tiler →     │  Memory      │  Metrics           │
│ Backend  │  Scheduler → │  Hierarchy   │  Collector         │
│          │  Instruction │  (SRAM+DRAM) │                    │
│          │  Stream      │              │                    │
├──────────┼──────────────┼──────────────┼────────────────────┤
│ Three.js │   models/    │  Controller  │    config.py       │
│ D3.js    │  LSTM Ref.   │  (ISA 실행)  │  (HW 파라미터)      │
│ React    │  SolarX      │              │                    │
└──────────┴──────────────┴──────────────┴────────────────────┘

데이터 흐름:
  PyTorch 모델 → Weight 추출
  → 타일링(Tiling, 행렬을 어레이 크기 블록으로 분할)
  → 컴파일러/스케줄러(Compiler/Scheduler, 타일을 ISA 명령어 스트림으로 변환)
  → Controller가 명령어 실행 → Systolic Array 연산
  → 결과 검증 & 성능 분석
  → 웹 뮤지엄에서 시각화 & 인터랙션
```

## Quick Start

### 시뮬레이터 (Python)

```bash
# 의존성 설치
pip install numpy matplotlib
pip install torch    # PyTorch 비교 검증용 (선택)
pip install pytest   # 테스트용

# 패키지 설치
pip install -e .

# 테스트 실행 (33개 전체 통과)
python -m pytest tests/ -v

# 데모 실행
python examples/demo_matmul.py           # 행렬 곱셈 기본 동작
python examples/demo_lstm_inference.py   # 소규모 LSTM 추론
python examples/demo_solarx.py           # SolarX 모델 전체 파이프라인
```

### 웹 뮤지엄 (Next.js + FastAPI)

```bash
# 프로젝트 루트에서 한 줄 실행 (백엔드 + 프론트엔드 동시 기동)
pip install fastapi uvicorn   # 최초 1회
python start_web.py

# 또는 pip install -e . 후 어디서든:
accsim-web
```

브라우저에서 **http://localhost:3000** 접속 → `/ko/intro` (한국어 인트로)로 자동 리다이렉트됩니다.

> 백엔드 없이도 프론트엔드만 실행 가능합니다 (내장 fallback 데이터 사용).
> Fallback 모드에서도 어레이 크기·배치 사이즈·시퀀스 길이 슬라이더에 반응하여 차트가 갱신됩니다.
> 실제 사이클 정확 시뮬레이션을 실행하려면 백엔드가 필요합니다.

## 주요 결과

### 정확도
| 비교 대상 | 오차 |
|-----------|------|
| Systolic Array vs NumPy matmul | < 2.22e-16 (기계 엡실론) |
| NumPy LSTM vs PyTorch LSTM | 3.53e-08 |
| 시뮬레이터 gate 연산 vs 레퍼런스 | PASS (2.22e-16) |

### SolarX LSTM 추론 성능 (8x8 어레이, 1 GHz 가정)
| 지표 | 값 |
|------|-----|
| 총 사이클 | 503,448 cycles |
| 추론 시간 | 503.45 μs |
| 시퀀스 길이 | 24 timesteps |
| PE 활용률 (batch=1) | 6.7% |
| PE 활용률 (batch=8) | 36.4% |
| W_ih 타일 수 | 32 (weight load 1회) |
| W_hh 타일 수 | 256 (weight load 8회) |

> batch=1(실시간 추론)에서 활용률이 낮은 것은 matrix-vector 연산의 본질적 한계입니다.
> batch=8로 묶으면 활용률이 5.4배 향상됩니다.

### 테스트
- **33개 테스트 전체 통과** (PE, Systolic Array, Memory, LSTM, Tiler)
- 실행 시간: ~3초

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/config` | 하드웨어 설정 조회 |
| `GET` | `/api/demo/matmul` | 행렬 곱셈 데모 |
| `GET` | `/api/demo/lstm` | LSTM 추론 데모 |
| `GET` | `/api/demo/solarx` | SolarX 전체 파이프라인 |
| `POST` | `/api/run` | 커스텀 시뮬레이션 실행 (`array_size`, `batch_size`, `seq_len`) |
| `POST` | `/api/run/matmul` | 커스텀 행렬 곱셈 |

## 기술 스택

| 분류 | 기술 |
|------|------|
| 언어 | Python 3.11+, TypeScript |
| 수치 연산 | NumPy |
| 시각화 (Python) | Matplotlib |
| ML 프레임워크 | PyTorch (레퍼런스 검증용) |
| 테스트 | pytest |
| 빌드 | pyproject.toml |
| 웹 프론트엔드 | Next.js 14, React 18, Tailwind CSS |
| 3D 시각화 | Three.js, React Three Fiber, Drei |
| 데이터 시각화 | D3.js |
| 애니메이션 | Framer Motion |
| 다국어 | next-intl (한국어/영어) |
| 상태 관리 | Zustand |
| 웹 백엔드 | FastAPI, Uvicorn |

## 프로젝트 구조

```
accsim/
├── core/           # 시뮬레이션 엔진 (C++ 교체 경계)
│   ├── pe.py               # Processing Element (MAC 연산)
│   ├── systolic_array.py   # NxN Systolic Array
│   ├── memory.py           # SRAM + DRAM 메모리 계층
│   ├── controller.py       # 명령어 디스패치 & 실행
│   ├── clock.py            # 글로벌 사이클 카운터
│   └── datatypes.py        # 고정소수점 타입
├── compiler/       # 모델 → 명령어 변환
│   ├── instruction.py      # ISA 정의 (9 opcodes)
│   ├── tiler.py            # 행렬 타일링
│   ├── scheduler.py        # 명령어 스케줄링
│   ├── exporter.py         # PyTorch weight 추출
│   └── lstm_compiler.py    # LSTM 컴파일 패스
├── analysis/       # 성능 분석
│   ├── metrics.py          # 메트릭 수집
│   ├── roofline.py         # Roofline 모델
│   ├── comparison.py       # HW vs SW 비교
│   └── visualizer.py       # 시각화
├── models/         # 모델 레퍼런스
│   ├── lstm.py             # NumPy LSTM
│   └── solarx_bridge.py    # SolarX 연동
├── web/            # 인터랙티브 웹 뮤지엄
│   ├── app.py              # FastAPI 서버
│   ├── simulator_api.py    # 시뮬레이션 API 브릿지
│   ├── korean.py           # 한국어 라벨
│   └── frontend/           # Next.js 14 뮤지엄
│       ├── src/
│       │   ├── app/[locale]/   # 9개 전시관 페이지
│       │   ├── components/     # Three.js, D3, UI 컴포넌트
│       │   ├── hooks/          # useSimulator, useScrollProgress
│       │   └── lib/            # API 클라이언트, 타입 정의
│       └── messages/           # i18n (ko.json, en.json)
└── config.py       # 가속기 설정
```

## 트러블슈팅

### 백엔드 없이 프론트엔드만 실행할 때
백엔드(FastAPI)가 꺼져 있으면 프론트엔드는 자동으로 fallback 데이터를 사용합니다. 성능 실험실의 슬라이더(어레이 크기, 배치 사이즈, 시퀀스 길이)는 fallback 모드에서도 정상 동작하며, 파라미터에 따라 차트가 즉시 갱신됩니다. 화면 상단에 "Demo data" 배지가 표시되면 fallback 모드입니다.

### 포트 충돌
```bash
# 8080 포트 사용 중인 프로세스 확인
lsof -i :8080    # macOS/Linux
netstat -ano | findstr :8080   # Windows

# 3000 포트 사용 중인 프로세스 확인
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### 버전 요구사항
- **Python**: 3.11 이상
- **Node.js**: 18 이상 (Next.js 14 요구)
- **npm**: 9 이상

### npm 의존성 설치 문제
```bash
cd accsim/web/frontend
rm -rf node_modules package-lock.json   # 캐시 초기화
npm install
```

## 라이선스

MIT
