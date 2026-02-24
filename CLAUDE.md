# AccSim - AI Accelerator Simulator

Systolic Array 기반 행렬 연산 가속기의 사이클 정확도 시뮬레이터.
SolarX 프로젝트의 LSTM 모델을 이 가속기 위에서 추론 실행하여 HW-SW Co-design 역량을 시연한다.

## Build & Run

```bash
# 의존성 설치
pip install numpy matplotlib
pip install torch        # optional, SolarX bridge/PyTorch 비교용
pip install pytest       # 테스트용

# 테스트
python -m pytest tests/ -v

# 데모 실행
python examples/demo_matmul.py
python examples/demo_lstm_inference.py
python examples/demo_solarx.py
```

프로젝트는 pyproject.toml 기반이며 `pip install -e .` 으로도 설치 가능.

## Architecture

```
accsim/
├── core/           # 시뮬레이션 엔진 (C++ 교체 경계)
│   ├── pe.py               # Weight-stationary Processing Element (MAC)
│   ├── systolic_array.py   # NxN Systolic Array, 사이클 정확 dataflow
│   ├── memory.py           # SRAM 3-buffer + DRAM 레이턴시 모델
│   ├── controller.py       # 명령어 디스패치 & 실행
│   ├── clock.py            # 글로벌 사이클 카운터
│   └── datatypes.py        # 고정소수점 타입
├── compiler/       # 모델 → 명령어 변환
│   ├── instruction.py      # ISA 정의 (9 opcodes)
│   ├── tiler.py            # 행렬 타일링 전략
│   ├── scheduler.py        # 타일 → 명령어 스트림
│   ├── exporter.py         # PyTorch weight 추출
│   └── lstm_compiler.py    # LSTM 전용 컴파일 패스
├── analysis/       # 성능 분석 & 시각화
│   ├── metrics.py          # 사이클/활용률/대역폭 메트릭
│   ├── roofline.py         # Roofline 모델 플롯
│   ├── comparison.py       # HW vs SW 수치 비교
│   └── visualizer.py       # PE 히트맵, 타임라인
├── models/         # 모델 로딩 & 레퍼런스
│   ├── lstm.py             # NumPy 레퍼런스 LSTM
│   └── solarx_bridge.py    # SolarX 모델 연동
└── config.py       # AcceleratorConfig 데이터클래스
```

## Key Conventions

- **Python 3.11+**, 모든 수치 연산은 `np.float64`
- Systolic array는 **weight-stationary** 방식: `C = A @ W`
  - A(activation)는 좌→우, psum은 상→하, weight는 PE에 고정
- LSTM에서 `gates = W_ih @ x_t` 시, `src1=W_ih`(A), `src2=x_t`(W) 순서로 MATMUL 명령어 구성
- Controller의 `_read_from_any_sram()`은 3개 SRAM 버퍼 중 키가 있는 곳에서 자동 읽기
- 테스트에서 정확도 검증 기준: matmul < 1e-10, LSTM NumPy vs PyTorch < 1e-5

## ISA (9 opcodes)

`LOAD_WEIGHT`, `LOAD_INPUT`, `MATMUL`, `STORE`, `ACT_SIGMOID`, `ACT_TANH`, `ELEM_MUL`, `ELEM_ADD`, `NOP`

## SolarX Integration

- 모델 경로: `C:/dev/SolarX/src/lstm_solar_model.pth`
- LSTM: input_size=8, hidden_size=64, seq_len=24
- PyTorch gate order: (i, f, g, o), 각 64행
- W_ih(256,8): K=8 → 어레이 크기와 일치, 타일 1개
- W_hh(256,64): K=64 → 8개 weight 타일

## C++ Upgrade Path

`accsim/core/` 전체가 C++ 교체 대상. pybind11으로 동일 API 유지.
`compiler/`, `analysis/`, `models/`는 Python 유지.
