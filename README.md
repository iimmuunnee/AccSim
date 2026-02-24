# AccSim — AI 가속기 시뮬레이터

> Systolic Array 기반 행렬 연산 가속기의 **사이클 정확도(cycle-accurate) 시뮬레이터**입니다.
> 실제 AI 모델(LSTM)을 가상 하드웨어 위에서 돌려보고, 성능을 분석합니다.

---

## 이 프로젝트가 뭔가요?

**AI 가속기**는 딥러닝 연산을 빠르게 처리하는 전용 칩입니다. GPU보다 더 특화된 하드웨어로, Tesla FSD 칩이나 Google TPU가 대표적입니다.

이런 칩을 실제로 만들기 전에, **소프트웨어로 동작을 미리 시뮬레이션**해볼 수 있습니다. 마치 건물을 짓기 전에 3D 모델링으로 구조를 검증하는 것처럼요.

AccSim은 이 시뮬레이터입니다:
- 가속기의 핵심 구조인 **Systolic Array**(연산 유닛이 격자 형태로 배열된 구조)를 Python으로 구현
- 매 클럭 사이클마다 데이터가 어떻게 흐르는지 정확하게 추적
- 실제 AI 모델(태양광 발전량 예측 LSTM)을 이 가상 칩 위에서 추론 실행

## 왜 이 프로젝트를 했는가

**Tesla AI Hardware 팀** 직무 지원을 위해 만들었습니다.

Tesla는 자체 AI 칩(FSD Chip, Dojo)을 설계하며, 하드웨어와 소프트웨어를 함께 최적화하는 **HW-SW Co-design** 역량을 중시합니다. 이 프로젝트는 그 역량을 직접 시연합니다:

| 역량 | 시연 내용 |
|------|----------|
| **HW 아키텍처 이해** | Systolic Array를 사이클 단위로 구현 |
| **컴파일러/스케줄링** | 모델 → 타일링 → 명령어 스트림 변환 |
| **성능 분석** | Roofline 모델, PE 활용률, 사이클 분석 |
| **End-to-End 통합** | PyTorch 모델 → 가속기 시뮬레이션 → 결과 검증 |

## 핵심 기능

### 1. Systolic Array 시뮬레이션
- **Weight-Stationary** 방식의 NxN Processing Element 배열
- 매 사이클마다 activation이 좌→우, partial sum이 상→하로 흐르는 dataflow를 정확히 모델링
- SRAM 3-buffer + DRAM 레이턴시를 포함한 메모리 계층 시뮬레이션

### 2. LSTM 추론
- 태양광 발전량 예측 모델(SolarX)을 가속기 위에서 실행
- NumPy 레퍼런스 ↔ PyTorch ↔ 시뮬레이터 3자 교차 검증
- 9개 명령어(ISA)로 LSTM의 모든 연산을 표현

### 3. 성능 분석
- Roofline 모델 플롯
- PE 히트맵 (어떤 연산 유닛이 얼마나 일했는지)
- 사이클 breakdown (어디서 시간이 소모되는지)

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   AccSim                        │
├──────────────┬──────────────┬───────────────────┤
│   compiler/  │    core/     │    analysis/      │
│              │              │                   │
│  PyTorch     │  Systolic    │  Roofline Model   │
│  Weight      │  Array       │  PE Heatmap       │
│  Export      │  (NxN PEs)   │  Cycle Breakdown  │
│      ↓       │      ↑       │       ↑           │
│  Tiler →     │  Memory      │  Metrics          │
│  Scheduler → │  Hierarchy   │  Collector        │
│  Instruction │  (SRAM+DRAM) │                   │
│  Stream      │              │                   │
├──────────────┼──────────────┼───────────────────┤
│   models/    │  Controller  │    config.py      │
│  LSTM Ref.   │  (ISA 실행)  │  (HW 파라미터)    │
│  SolarX      │              │                   │
└──────────────┴──────────────┴───────────────────┘

데이터 흐름:
  PyTorch 모델 → Weight 추출 → 타일링 → 명령어 생성
  → Controller가 명령어 실행 → Systolic Array 연산
  → 결과 검증 & 성능 분석
```

## Quick Start

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

## 기술 스택

| 분류 | 기술 |
|------|------|
| 언어 | Python 3.11+ |
| 수치 연산 | NumPy |
| 시각화 | Matplotlib |
| ML 프레임워크 | PyTorch (레퍼런스 검증용) |
| 테스트 | pytest |
| 빌드 | pyproject.toml |

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
│   └── solarx_bridge.py   # SolarX 연동
└── config.py       # 가속기 설정
```

## 라이선스

MIT
