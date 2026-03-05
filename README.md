# AccSim — AI Accelerator Simulator

> Systolic Array 기반 AI 가속기의 **사이클 정확도(cycle-accurate) 시뮬레이터**와,
> 그 내부를 탐험할 수 있는 **인터랙티브 기술 전시 웹사이트**입니다.

<!--
  실제 칩 없이, 칩이 있는 것처럼 AI를 돌려보고 성능까지 분석하는 도구.
  9개 전시관(Hall)으로 구성된 웹사이트에서 가속기의 모든 것을 시각적으로 체험합니다.
-->

---

## Project Overview

### AI 가속기란 무엇인가

AI 모델은 해마다 수십 배씩 커지고 있습니다. ChatGPT가 답을 생성하고, 자율주행 차가 주변을 판단하고, 넷플릭스가 영화를 추천하는 — 이 모든 것의 뒤에는 엄청난 양의 **행렬 곱셈(Matrix Multiplication)** 이 있습니다.

기존의 CPU는 범용 작업을 위해 만들어졌고, GPU도 원래 그래픽 처리용이었습니다. AI 연산의 규모가 수천억 번의 곱셈-덧셈에 이르자, 이들만으로는 속도와 전력 효율을 감당할 수 없게 되었습니다.

그래서 등장한 것이 **AI 전용 가속기**입니다. Google TPU, Tesla FSD Chip, Tesla Dojo 같은 칩들은 오직 AI 연산만을 위해 설계되었습니다. 이 칩들의 핵심에는 **Systolic Array** — 수백 개의 작은 연산 유닛이 격자 형태로 배열되어, 데이터를 흘려보내며 동시에 계산하는 구조 — 가 있습니다.

### 왜 시뮬레이터가 필요한가

반도체 칩 하나를 만드는 데는 수개월의 시간과 수백억 원의 비용이 듭니다. 설계를 잘못하면 전부 다시 만들어야 합니다. 그래서 실제 칩을 제작하기 전에, **소프트웨어로 먼저 "리허설"을 하는 것**이 필수입니다.

건축가가 건물을 짓기 전에 3D 모델링을 하고, 자동차 회사가 신차를 출시하기 전에 풍동 시뮬레이션을 하는 것과 같습니다.

### AccSim이 하는 일

**AccSim**은 가상의 AI 가속기를 소프트웨어로 구현하고, 그 위에서 실제 AI 모델(LSTM)을 실행하는 **사이클 정확도 시뮬레이터**입니다.

- 칩 내부의 매 클럭 사이클(10억분의 1초)마다 데이터 흐름, 연산 유닛 상태, 메모리 접근을 정밀하게 추적합니다
- 실제 AI 모델(태양광 발전량 예측 LSTM)을 가상 칩 위에서 추론 실행하여, 진짜 하드웨어와 동일한 과정을 재현합니다
- 결과를 인터랙티브 웹 전시관에서 직관적으로 시각화합니다

### 왜 이 프로젝트를 만들었는가

이 프로젝트는 **HW-SW Co-design 역량**을 시연하기 위해 만들었습니다.

| 역량 | 시연 내용 |
|------|----------|
| **HW 아키텍처 이해** | Systolic Array를 사이클 단위로 직접 구현 |
| **컴파일러/스케줄링** | 모델 → 타일링 → ISA 명령어 스트림 변환 |
| **성능 분석** | Roofline 모델, PE 활용률, 사이클 분석 |
| **End-to-End 통합** | PyTorch 모델 → 가속기 시뮬레이션 → 결과 검증 |
| **시각화 & 커뮤니케이션** | 인터랙티브 웹 전시관으로 기술을 직관적으로 전달 |

---

## Exhibition Website Concept

이 프로젝트는 단순한 대시보드가 아닙니다. **기술 전시관(Tech Exhibition)** 컨셉의 인터랙티브 웹사이트입니다.

### HALL 구조

웹사이트는 **9개의 전시관(Hall)** 으로 구성되어 있습니다. 각 Hall은 AI 가속기의 한 가지 핵심 개념을 담당하며, 방문자는 전시를 순서대로 관람하듯 자연스럽게 탐험합니다.

### Scroll Snap 기반 탐험 UX

각 Hall 내부는 여러 섹션으로 나뉘며, **Full-page Scroll Snap** 방식으로 동작합니다. 마우스 휠, 터치 스와이프, 키보드 방향키로 한 섹션씩 넘기며, 각 섹션이 화면 전체를 채우는 Apple Keynote 스타일의 프레젠테이션 경험을 제공합니다.

- 우측에 **섹션 진행 인디케이터(dot)** 가 현재 위치를 표시합니다
- **Smooth scroll 애니메이션**으로 섹션 간 전환이 부드럽게 이루어집니다
- 각 Hall 하단에는 **다음 Hall 이동 버튼**이 있어 자연스러운 전시 흐름을 만듭니다

### 인터랙티브 시각화

정적인 설명 대신, 사용자가 직접 조작하고 결과를 관찰하는 인터랙티브 시각화를 중심으로 설계했습니다:

- **3D Systolic Array** — Three.js로 구현한 PE 격자와 데이터 흐름 파티클 애니메이션
- **실시간 성능 차트** — D3.js Roofline 모델, PE 히트맵, 사이클 분석
- **파라미터 조정** — 슬라이더로 어레이 크기, 배치 사이즈 등을 변경하면 즉시 결과 반영
- **지식 수준별 설명** — Beginner / Intermediate / Expert 모드에 따라 설명 깊이가 달라집니다
- **용어 Tooltip** — 전문 용어에 마우스를 올리면 수준별 설명이 표시됩니다
- **한국어/영어 완전 지원** — `/ko/*`, `/en/*` 경로로 언어 전환

---

## Demo / Screenshots

> 스크린샷은 추후 추가 예정입니다.

**주요 화면 구성:**

| 화면 | 설명 |
|------|------|
| Intro Hall | AI 연산 수요 폭발 그래프 + CPU vs GPU vs Accelerator 경주 |
| Chip Hall | 3D Systolic Array + PE 해부도 + 데이터 흐름 파티클 |
| Execution Hall | LSTM 8단계 연산의 Gantt 차트 타임라인 + Playhead |
| Performance Lab | Roofline 차트 + PE 히트맵 + 실시간 파라미터 조절 대시보드 |
| Architecture Hall | PCB 스타일 인터랙티브 시스템 다이어그램 |
| Live Demo | RUN 버튼 → 3단계 진행 애니메이션 → 결과 드라마틱 reveal |

---

## Quick Start

### 시뮬레이터 (Python)

```bash
# 의존성 설치
pip install numpy matplotlib
pip install torch        # PyTorch 비교 검증용 (선택)
pip install pytest       # 테스트용

# 패키지 설치
pip install -e .

# 테스트 실행 (33개 전체 통과)
python -m pytest tests/ -v

# 데모 실행
python examples/demo_matmul.py           # 행렬 곱셈 기본 동작
python examples/demo_lstm_inference.py   # 소규모 LSTM 추론
python examples/demo_solarx.py           # SolarX 모델 전체 파이프라인
```

### 웹 전시관 (Next.js + FastAPI)

```bash
# 백엔드 실행
pip install fastapi uvicorn
cd accsim/web && uvicorn app:app --port 8080

# 프론트엔드 실행 (새 터미널)
cd accsim/web/frontend
npm install
npm run dev
```

브라우저에서 **http://localhost:3000** 접속 → `/ko/intro`로 자동 리다이렉트됩니다.

> 백엔드 없이도 프론트엔드만 실행 가능합니다. 내장 fallback 데이터를 사용하여 Performance Lab과 Live Demo가 동작합니다.

### 버전 요구사항

- **Python**: 3.11 이상
- **Node.js**: 18 이상 (Next.js 14 요구)
- **npm**: 9 이상

---

## Features

### Scroll Snap Section Layout
각 Hall 내부의 콘텐츠가 Full-page 섹션으로 나뉘어, 한 번의 스크롤로 정확히 한 섹션씩 이동합니다. 휠, 터치, 키보드(Arrow, PageUp/Down, Home/End)를 모두 지원합니다.

### Smooth Scroll Transition
섹션 전환 시 easeInOutCubic 곡선을 적용한 800ms 애니메이션이 부드러운 전환 효과를 만듭니다. 트랙패드 제스처의 관성 스크롤을 감지하여 한 번의 제스처에 하나의 전환만 발생하도록 제어합니다.

### Section Progress Indicator
우측에 고정된 dot 인디케이터가 현재 섹션 위치를 실시간으로 표시합니다. dot을 클릭하면 해당 섹션으로 직접 이동할 수 있습니다.

### Tooltip Concept System
전문 용어(`Systolic Array`, `PE`, `Roofline` 등)에 마우스를 올리면 사용자의 지식 수준에 맞는 설명이 나타납니다. Beginner는 비유 중심, Expert는 수식과 기술 용어 중심으로 설명합니다.

### 3D Chip Visualization
React Three Fiber로 구현한 인터랙티브 3D Systolic Array입니다. NxN PE 격자를 시각화하고, activation(좌→우)과 partial sum(상→하)의 데이터 흐름을 파티클 애니메이션으로 보여줍니다. 어레이 크기(4x4, 8x8, 16x16)를 선택할 수 있으며, Deep Dive 모드에서 PE별 활용률을 오버레이합니다.

### Performance Lab
어레이 크기, 배치 사이즈, 시퀀스 길이를 슬라이더로 조절하면 백엔드의 실제 시뮬레이터가 실행되어 Roofline 차트, PE 히트맵, 사이클 분석이 실시간으로 갱신됩니다. 백엔드 없이도 fallback 데이터로 동작합니다.

### Interactive Architecture Diagram
AccSim의 6개 핵심 모듈(Compiler, Controller, Systolic Array, SRAM, DRAM, Analysis)을 PCB 스타일 다이어그램으로 시각화합니다. 노드를 클릭하면 해당 모듈의 역할, 입출력, 소스 파일 경로가 표시됩니다.

### Live Simulation Demo
어레이 크기, 배치 사이즈, 정밀도를 선택하고 RUN 버튼을 누르면 Compiling → Executing → Analyzing 3단계 진행 애니메이션과 함께 실제 시뮬레이션이 실행됩니다. 결과는 메트릭 카드, 차트, 타임라인 테이블로 드라마틱하게 reveal됩니다.

### Exhibition UX System
전체 사이트가 기술 전시관 컨셉으로 통일되어 있습니다. 다크 테마 기반 UI, Hall 간 네비게이션, ScrollReveal 애니메이션, count-up 숫자 효과, stagger reveal 등이 일관된 전시 경험을 만듭니다.

---

## Hall Structure

| Hall | 이름 | 경로 | 설명 |
|------|------|------|------|
| **1** | Intro | `/intro` | AI 연산 수요의 폭발적 증가와 HW 성능 격차를 시각화. CPU vs GPU vs Accelerator 비교 경주로 전용 가속기의 필요성을 직관적으로 보여줍니다. |
| **2** | Accelerator | `/accelerator` | 동일한 행렬 연산을 CPU(순차), GPU(행 병렬), Accelerator(대각선 웨이브) 3가지 방식으로 처리하는 속도 비교. 인터랙티브 경주 시뮬레이션으로 차이를 체감합니다. |
| **3** | Chip | `/chip` | Systolic Array의 내부 구조를 해부합니다. PE(Processing Element) 단위의 MAC 연산, Weight-Stationary 데이터플로우(weight 고정, activation 좌→우, psum 상→하)를 3D 시각화로 설명합니다. |
| **4** | Simulator | `/simulator` | Model → Compiler → Simulator → Analysis 4단계 파이프라인을 컨베이어 벨트 비유로 설명합니다. 각 단계의 입출력과 코드 샘플을 보여줍니다. |
| **5** | Execution | `/execution` | LSTM 단일 타임스텝의 8개 연산 단계를 오케스트라 악보(Gantt 차트) 형태로 시각화합니다. Playhead가 사이클을 따라 이동하며, 각 단계의 ISA opcode와 사이클 수를 보여줍니다. |
| **6** | Performance Lab | `/lab` | 실시간 성능 실험실. 어레이 크기, 배치 사이즈, 시퀀스 길이를 조절하면 Roofline 차트, PE 히트맵, 사이클 분석이 즉시 갱신됩니다. |
| **7** | Architecture | `/architecture` | AccSim의 전체 시스템 아키텍처를 PCB 스타일 인터랙티브 다이어그램으로 표현합니다. 각 모듈(Compiler, Controller, Systolic Array, SRAM, DRAM, Analysis)을 클릭하여 상세 정보를 확인합니다. |
| **8** | Live Demo | `/demo` | 파라미터를 선택하고 실제 시뮬레이션을 실행합니다. Compiling → Executing → Analyzing 3단계 진행 후, 성능 메트릭과 차트가 드라마틱하게 나타납니다. |
| **9** | About | `/about` | 프로젝트 요약 통계(9 opcodes, cycle-accurate, 6 components), 기술 스택, 개발 동기, 개발자 정보를 소개합니다. |

---

## Tech Stack

### Frontend

| 기술 | 용도 |
|------|------|
| **Next.js 14** | App Router 기반 SSG, i18n 라우팅 (`/ko/*`, `/en/*`) |
| **React 18** | 컴포넌트 기반 UI |
| **TypeScript** | 타입 안전성 |
| **Tailwind CSS** | 다크 테마 기반 스타일링 |
| **Framer Motion** | 스크롤 애니메이션, 전환 효과, stagger reveal |
| **Three.js / React Three Fiber** | 3D Systolic Array 시각화, PE 격자, 데이터 파티클 |
| **D3.js** | Roofline 차트(log-log), PE 히트맵, 사이클 분석 원형 차트 |
| **next-intl** | 한국어/영어 다국어 지원 |
| **Zustand** | 전역 상태 관리 (섹션 인덱스, 지식 수준) |

### Backend

| 기술 | 용도 |
|------|------|
| **FastAPI** | 비동기 REST API 서버 |
| **Uvicorn** | ASGI 서버 |

### Simulator Engine

| 기술 | 용도 |
|------|------|
| **Python 3.11+** | 시뮬레이션 엔진 구현 |
| **NumPy** | 수치 연산 (float64 정밀도) |
| **PyTorch** | 레퍼런스 모델 검증, weight 추출 |
| **Matplotlib** | Python 측 시각화 (터미널 분석용) |
| **pytest** | 테스트 (33개 전체 통과) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            AccSim                               │
├─────────────┬───────────────┬───────────────┬───────────────────┤
│   web/      │  compiler/    │    core/      │   analysis/       │
│             │               │               │                   │
│  Next.js    │  PyTorch      │  Systolic     │  Roofline Model   │
│  Museum     │  Weight       │  Array        │  PE Heatmap       │
│  (9 Halls)  │  Export       │  (NxN PEs)    │  Cycle Breakdown  │
│     ↕       │      ↓        │      ↑        │       ↑           │
│  FastAPI    │  Tiler →      │  Memory       │  Metrics          │
│  Backend    │  Scheduler →  │  Hierarchy    │  Collector        │
│             │  Instruction  │  (SRAM+DRAM)  │                   │
│             │  Stream       │               │                   │
├─────────────┼───────────────┼───────────────┼───────────────────┤
│  Three.js   │   models/     │  Controller   │   config.py       │
│  D3.js      │  LSTM Ref.    │  (ISA 실행)   │  (HW 파라미터)    │
│  React      │  SolarX       │               │                   │
└─────────────┴───────────────┴───────────────┴───────────────────┘
```

### 데이터 흐름

```
PyTorch 모델 → Weight 추출 → 타일링(행렬을 어레이 크기 블록으로 분할)
  → 컴파일러/스케줄러(타일을 ISA 명령어 스트림으로 변환)
  → Controller가 명령어 실행 → Systolic Array 연산
  → 결과 검증 & 성능 분석
  → 웹 전시관에서 시각화 & 인터랙션
```

### 프로젝트 구조

```
accsim/
├── core/               # 시뮬레이션 엔진 (C++ 교체 대상)
│   ├── pe.py                   # Processing Element (MAC 연산)
│   ├── systolic_array.py       # NxN Systolic Array
│   ├── memory.py               # SRAM 3-buffer + DRAM 레이턴시
│   ├── controller.py           # ISA 명령어 디스패치 & 실행
│   ├── clock.py                # 글로벌 사이클 카운터
│   └── datatypes.py            # 고정소수점 타입
├── compiler/           # 모델 → 명령어 변환
│   ├── instruction.py          # ISA 정의 (9 opcodes)
│   ├── tiler.py                # 행렬 타일링 전략
│   ├── scheduler.py            # 타일 → 명령어 스트림
│   ├── exporter.py             # PyTorch weight 추출
│   └── lstm_compiler.py        # LSTM 전용 컴파일 패스
├── analysis/           # 성능 분석 & 시각화
│   ├── metrics.py              # 메트릭 수집기
│   ├── roofline.py             # Roofline 모델
│   ├── comparison.py           # HW vs SW 비교
│   └── visualizer.py           # PE 히트맵, 타임라인
├── models/             # 모델 레퍼런스
│   ├── lstm.py                 # NumPy LSTM 레퍼런스
│   └── solarx_bridge.py       # SolarX 모델 연동
├── web/                # 인터랙티브 웹 전시관
│   ├── app.py                  # FastAPI 서버
│   ├── simulator_api.py        # 시뮬레이션 API 브릿지
│   └── frontend/               # Next.js 14
│       ├── src/
│       │   ├── app/[locale]/       # i18n 라우팅 (ko/en)
│       │   ├── components/
│       │   │   ├── halls/          # 9개 전시관 컴포넌트
│       │   │   ├── layout/         # SnapContainer, HallNav, SectionProgress
│       │   │   ├── ui/             # ScrollReveal, Term, MetricCard, ...
│       │   │   ├── three/          # 3D Systolic Array (R3F)
│       │   │   └── d3/             # Roofline, Heatmap, CycleBreakdown
│       │   ├── hooks/              # useSnapScroll, useSimulator
│       │   ├── stores/             # Zustand (섹션, 지식 수준)
│       │   └── lib/                # API 클라이언트, 타입, 용어사전
│       └── messages/               # i18n JSON (ko, en)
└── config.py           # AcceleratorConfig 데이터클래스
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/config` | 하드웨어 설정 조회 |
| `GET` | `/api/demo/matmul` | 행렬 곱셈 데모 |
| `GET` | `/api/demo/lstm` | LSTM 추론 데모 |
| `GET` | `/api/demo/solarx` | SolarX 전체 파이프라인 |
| `POST` | `/api/run` | 커스텀 시뮬레이션 (`array_size`, `batch_size`, `seq_len`, `precision`) |
| `POST` | `/api/run/matmul` | 커스텀 행렬 곱셈 |

---

## Key UX Systems

### Scroll Snap Navigation

Full-page 스냅 스크롤 시스템(`useSnapScroll` hook)이 전체 전시 탐험의 기반입니다.

- **휠 이벤트**: 누적 deltaY가 임계값을 넘으면 한 섹션 전환. 트랙패드 관성 스크롤을 감지하여 제스처 잠금(gesture lock)으로 중복 전환을 방지합니다.
- **터치 스와이프**: 50px 이상 스와이프 시 전환.
- **키보드**: ArrowDown/Up, PageDown/Up, Home/End, Space 지원.
- **라우트 변경 감지**: Hall 간 페이지 이동 시 `usePathname()`으로 경로 변경을 감지하고, 스크롤 상태를 자동 초기화합니다.

### Smooth Section Transition

`easeInOutCubic` 곡선 기반 800ms 커스텀 스크롤 애니메이션. `requestAnimationFrame`으로 매 프레임 위치를 계산하여, CSS `scroll-behavior: smooth`보다 정밀한 제어가 가능합니다. 애니메이션 중 추가 입력은 무시되어 일관된 전환을 보장합니다.

### Exhibition UI

다크 테마 기반의 전시관 UI 시스템:

- **HallBackground**: 각 Hall의 정체성을 나타내는 배경 (gradient, grid, dots 패턴)
- **ScrollReveal**: Viewport 진입 시 fade-in + slide 애니메이션 (up/left/right 방향)
- **TransitionFlash**: 섹션 전환 시 미묘한 플래시 효과
- **NextHallButton**: 다음 전시관으로의 자연스러운 이동 유도
- **InfoPanel**: 핵심 정보를 강조하는 둥근 박스 패널

### Tooltip Concept Explanation

`Term` 컴포넌트와 `glossary.ts` 용어사전으로 구현한 개념 설명 시스템:

- 전문 용어에 마우스를 올리면 hover tooltip이 나타납니다
- `useKnowledgeLevel` store의 수준(beginner/intermediate/expert)에 따라 설명이 달라집니다
- Beginner: "공장의 조립 라인처럼..." 비유 중심
- Expert: "Weight-Stationary dataflow에서 psum은..." 기술 용어 중심

### Interactive Visualization

정적 이미지 대신 사용자가 직접 조작하는 시각화:

- **3D PE Grid**: Three.js Canvas에서 회전/확대 가능한 Systolic Array. 데이터 파티클이 실시간으로 흐릅니다.
- **Roofline Chart**: D3.js log-log 스케일 차트. 현재 워크로드가 compute-bound인지 memory-bound인지 시각적으로 판별합니다.
- **PE Heatmap**: NxN 격자에서 각 PE의 활용률을 색상으로 표현합니다.
- **Gantt Timeline**: LSTM 실행의 8개 연산 단계를 시간축으로 배치하고, playhead가 사이클을 따라 이동합니다.

---

## Troubleshooting

개발 과정에서 발생했던 주요 문제와 해결 방법입니다.

### 1. Scroll Snap 전환 속도 문제

**Problem**: CSS `scroll-snap-type: y mandatory`를 사용했을 때, 트랙패드 제스처의 관성(inertia)으로 인해 한 번의 스와이프에 2~3개 섹션이 넘어가는 현상이 발생했습니다.

**Cause**: 브라우저 기본 scroll snap은 연속적인 휠 이벤트를 각각 독립적인 스크롤로 처리합니다. 트랙패드의 관성 스크롤이 수십 개의 휠 이벤트를 생성하면, 각각이 다음 snap point로의 전환을 트리거합니다.

**Solution**: CSS scroll snap을 제거하고, JavaScript 커스텀 구현(`useSnapScroll`)으로 교체했습니다. 누적 deltaY 임계값(50) + 제스처 잠금(gesture lock) 메커니즘을 도입하여, 한 번의 제스처에 정확히 하나의 전환만 발생하도록 제어합니다. 제스처 종료는 800ms 무입력으로 판정합니다.

### 2. Tooltip 가독성 문제

**Problem**: 전문 용어 tooltip이 다크 배경 위에서 대비가 낮아 읽기 어려웠습니다. 특히 긴 설명이 잘리거나, 화면 가장자리에서 tooltip이 잘리는 문제가 있었습니다.

**Cause**: tooltip이 고정 위치에 렌더링되어 부모 요소의 `overflow: hidden`에 의해 잘렸고, 배경색과 텍스트 색의 대비 비율이 불충분했습니다.

**Solution**: tooltip의 배경을 반투명 `backdrop-blur` + 높은 대비 색상으로 변경하고, hover 인터랙션 영역을 넓혀 접근성을 개선했습니다.

### 3. Hall 전환 시 스크롤 상태 미초기화

**Problem**: 다른 Hall로 이동한 뒤 첫 스크롤 시 마지막 섹션까지 점프하는 버그가 발생했습니다. 우측 dot 인디케이터도 첫 번째가 아닌 이전 Hall의 마지막 위치에서 시작했습니다.

**Cause**: `SnapContainer`는 `layout.tsx`에 있어서 Hall 간 페이지 이동 시 재마운트되지 않습니다. `useSnapScroll`의 `currentIndex` ref가 이전 Hall의 값을 유지한 채, 새 Hall에서 첫 스크롤이 잘못된 인덱스를 기준으로 전환을 시도했습니다.

**Solution**: `useSnapScroll`에 `reset()` 함수를 추가하고, `SnapContainer`에서 `usePathname()`으로 경로 변경을 감지하여 Hall 전환 시 자동으로 `currentIndex`, `scrollTop`, 제스처 상태를 초기화하도록 수정했습니다.

### 4. Responsive Layout 문제

**Problem**: 모바일 및 태블릿에서 3D 시각화와 차트가 화면을 벗어나거나, 텍스트와 겹치는 레이아웃 깨짐이 있었습니다.

**Cause**: 고정 크기(px) 기반 레이아웃과 3D Canvas의 고정 해상도가 다양한 뷰포트 크기에 대응하지 못했습니다.

**Solution**: Tailwind의 반응형 유틸리티(`sm:`, `md:`, `lg:`)와 viewport 기반 크기(`vh`, `vw`)를 활용하여, 뷰포트에 따라 레이아웃이 자동 조정되도록 수정했습니다.

### 5. D3 차트 UI 겹침 문제

**Problem**: Performance Lab에서 Roofline 차트의 축 레이블과 PE 히트맵의 색상 범례가 겹치거나, 차트 영역이 컨테이너를 벗어나는 현상이 있었습니다.

**Cause**: D3.js 차트가 SVG 내부에서 고정 margin으로 렌더링되어, 컨테이너 크기 변화에 대응하지 못했습니다.

**Solution**: D3 차트에 반응형 viewBox와 동적 margin 계산을 적용하고, ResizeObserver로 컨테이너 크기 변화를 감지하여 차트를 재렌더링하도록 개선했습니다.

### 6. 3D 인터랙션 사용성 문제

**Problem**: 3D Systolic Array 시각화에서 OrbitControls의 회전/확대가 페이지 스크롤과 충돌하여, 3D를 조작하려다 페이지가 넘어가거나, 스크롤하려다 3D가 회전하는 문제가 있었습니다.

**Cause**: Three.js Canvas의 이벤트와 페이지 수준의 스크롤 이벤트가 동일한 휠/터치 이벤트를 소비하려 경쟁했습니다.

**Solution**: 3D Canvas 영역 위에서의 휠 이벤트를 Canvas가 우선 소비하도록 이벤트 전파를 제어하고, Canvas 외부에서만 페이지 스크롤이 동작하도록 분리했습니다.

### 7. Live Demo 구조 재설계

**Problem**: 초기 Live Demo는 파라미터 입력과 결과가 단일 화면에 나열되어, 시뮬레이션 실행의 "드라마"가 없었습니다. 사용자가 결과를 이미 다 보고 있는 상태에서 RUN 버튼을 누르는 것은 의미가 없었습니다.

**Cause**: 단순한 대시보드 레이아웃은 전시관 컨셉과 맞지 않았습니다.

**Solution**: 상태 머신(`idle` → `running` → `done`)을 도입하여 3단계 UX로 재설계했습니다. idle 상태에서는 파라미터 선택 + 큰 원형 RUN 버튼만 표시하고, running 상태에서는 Compiling → Executing → Analyzing 진행 애니메이션을, done 상태에서는 메트릭과 차트를 stagger 애니메이션으로 드라마틱하게 reveal합니다.

---

## Future Improvements

- **C++ 엔진 교체** — `accsim/core/` 전체를 C++로 재구현하고 pybind11로 Python API 유지. 시뮬레이션 속도 10~100배 향상 예상.
- **GPU vs TPU vs Custom Accelerator 비교** — 여러 아키텍처의 성능을 동일 워크로드로 비교하는 멀티 아키텍처 시뮬레이션.
- **Interactive Roofline Explorer** — Roofline 차트 위에서 파라미터를 드래그하여 compute-bound ↔ memory-bound 경계를 탐험하는 인터랙티브 도구.
- **Multi-chip Simulation** — 여러 가속기 칩 간의 데이터 분산과 통신 오버헤드를 모델링하는 분산 시뮬레이션.
- **Transformer 지원** — LSTM 외에 Attention 연산을 가속기 위에서 실행하고 성능을 분석.
- **WebGPU 기반 시각화** — Three.js의 WebGL 대신 WebGPU를 사용하여 더 큰 어레이의 실시간 시각화 지원.

---

## Author

| | |
|------|------|
| **이름** | 임휘훈 |
| **학교** | 조선대학교 AI·SW학부 (컴퓨터공학전공) |
| **이메일** | limhwihoon@gmail.com |
| **GitHub** | [github.com/iimmuunnee](https://github.com/iimmuunnee) |

> AI 가속기 아키텍처와 시스템 소프트웨어에 관심이 있는 컴퓨터공학 학부생입니다.
> HW-SW Co-design을 통해 효율적인 AI 추론 시스템을 설계하는 것이 목표입니다.

---

## License

MIT
