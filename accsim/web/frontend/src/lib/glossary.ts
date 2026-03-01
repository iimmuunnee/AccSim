export interface GlossaryEntry {
  term: { ko: string; en: string }
  definition: {
    beginner: { ko: string; en: string }
    intermediate: { ko: string; en: string }
    expert: { ko: string; en: string }
  }
  analogy?: { ko: string; en: string }
}

export const glossary: Record<string, GlossaryEntry> = {
  systolicArray: {
    term: { ko: '시스톨릭 어레이', en: 'Systolic Array' },
    definition: {
      beginner: {
        ko: '데이터가 심장 박동처럼 규칙적으로 흐르며 계산하는 칩 구조',
        en: 'A chip structure where data flows rhythmically like a heartbeat to perform calculations',
      },
      intermediate: {
        ko: 'PE가 격자형으로 배열되어 데이터를 순차적으로 전달하며 행렬 곱셈을 병렬 수행하는 하드웨어 구조',
        en: 'A hardware structure where PEs are arranged in a grid, passing data sequentially to perform matrix multiplication in parallel',
      },
      expert: {
        ko: 'NxN PE 격자에서 weight-stationary dataflow로 C=A@W를 O(N) 사이클에 수행하는 공간적 아키텍처',
        en: 'A spatial architecture performing C=A@W in O(N) cycles via weight-stationary dataflow on an NxN PE grid',
      },
    },
    analogy: {
      ko: '공장 조립 라인: 각 작업자(PE)가 자기 위치에서 부품을 받아 조립하고 다음으로 전달',
      en: 'Like a factory assembly line: each worker (PE) receives parts at their station, assembles, and passes on',
    },
  },
  PE: {
    term: { ko: 'PE (처리 요소)', en: 'PE (Processing Element)' },
    definition: {
      beginner: {
        ko: '곱셈과 덧셈을 수행하는 가장 작은 계산 단위',
        en: 'The smallest computing unit that performs multiplication and addition',
      },
      intermediate: {
        ko: 'MAC(곱셈-누산) 연산을 수행하는 시스톨릭 어레이의 기본 단위. 가중치를 저장하고 입력과 곱한 뒤 부분합에 누적',
        en: 'The basic unit of a systolic array that performs MAC operations. Stores a weight, multiplies with input, and accumulates to partial sum',
      },
      expert: {
        ko: 'Weight register + MAC unit + accumulator로 구성. Weight-stationary에서 W는 고정, activation은 수평, psum은 수직으로 전파',
        en: 'Composed of weight register + MAC unit + accumulator. In weight-stationary mode, W is fixed, activation flows horizontally, psum vertically',
      },
    },
  },
  MAC: {
    term: { ko: 'MAC 연산', en: 'MAC Operation' },
    definition: {
      beginner: {
        ko: '두 수를 곱한 뒤 기존 값에 더하는 연산 (a×b+c)',
        en: 'Multiply two numbers and add to an existing value (a×b+c)',
      },
      intermediate: {
        ko: 'Multiply-Accumulate: 신경망 연산의 핵심 단위. 행렬 곱셈의 각 원소 계산이 MAC 연산의 반복',
        en: 'Multiply-Accumulate: the core unit of neural network computation. Each element of matrix multiplication is a series of MAC ops',
      },
      expert: {
        ko: 'FMA(Fused Multiply-Add)와 동일. 단일 사이클 throughput이 가속기 피크 성능을 결정. N² PE → N² MAC/cycle',
        en: 'Equivalent to FMA. Single-cycle throughput determines peak accelerator performance. N² PEs → N² MACs/cycle',
      },
    },
  },
  SRAM: {
    term: { ko: 'SRAM', en: 'SRAM' },
    definition: {
      beginner: {
        ko: '칩 안에 있는 빠른 메모리. 용량은 작지만 매우 빠름',
        en: 'Fast memory inside the chip. Small capacity but very fast',
      },
      intermediate: {
        ko: '온칩 정적 메모리. 3-버퍼 구조로 입력, 가중치, 출력을 각각 저장하여 대역폭을 극대화',
        en: 'On-chip static memory. Triple-buffer structure stores inputs, weights, and outputs separately to maximize bandwidth',
      },
      expert: {
        ko: '6T SRAM cell 기반. AccSim에서는 3-bank로 구성하여 concurrent read/write로 memory stall을 최소화',
        en: '6T SRAM cell based. AccSim uses 3 banks enabling concurrent read/write to minimize memory stalls',
      },
    },
  },
  DRAM: {
    term: { ko: 'DRAM', en: 'DRAM' },
    definition: {
      beginner: {
        ko: '칩 밖에 있는 대용량 메모리. 느리지만 많은 데이터를 저장할 수 있음',
        en: 'Large off-chip memory. Slower but can store much more data',
      },
      intermediate: {
        ko: '오프칩 메모리. SRAM보다 100배 이상 느리지만 대용량. DRAM 접근이 성능 병목의 주 원인',
        en: 'Off-chip memory. 100x+ slower than SRAM but much larger. DRAM access is the main performance bottleneck',
      },
      expert: {
        ko: 'HBM/LPDDR 등. 대역폭(GB/s)이 Roofline 모델의 memory roof를 결정. AccSim은 latency model로 stall cycle을 정확히 모델링',
        en: 'HBM/LPDDR etc. Bandwidth (GB/s) determines memory roof in Roofline model. AccSim models stall cycles accurately via latency model',
      },
    },
  },
  throughput: {
    term: { ko: '처리량', en: 'Throughput' },
    definition: {
      beginner: {
        ko: '초당 처리할 수 있는 연산의 양',
        en: 'The amount of computation that can be processed per second',
      },
      intermediate: {
        ko: '단위 시간당 수행되는 연산 수(GOPS). 하드웨어의 실질적인 성능 지표',
        en: 'Operations per unit time (GOPS). The practical performance metric of hardware',
      },
      expert: {
        ko: 'Achieved GOPS = total_ops / (cycles / freq). Roofline의 Y축. 피크 대비 비율이 활용률',
        en: 'Achieved GOPS = total_ops / (cycles / freq). Y-axis of Roofline. Ratio to peak is utilization',
      },
    },
  },
  latency: {
    term: { ko: '레이턴시', en: 'Latency' },
    definition: {
      beginner: {
        ko: '작업 하나를 완료하는 데 걸리는 시간',
        en: 'The time it takes to complete one task',
      },
      intermediate: {
        ko: '입력에서 출력까지의 지연 시간. 메모리 레이턴시가 높으면 PE가 대기(stall)하게 됨',
        en: 'Delay from input to output. High memory latency causes PEs to stall',
      },
      expert: {
        ko: 'SRAM: 1-2 cycles, DRAM: 50-200 cycles. Latency hiding은 prefetch와 double buffering으로 구현',
        en: 'SRAM: 1-2 cycles, DRAM: 50-200 cycles. Latency hiding via prefetch and double buffering',
      },
    },
  },
  utilization: {
    term: { ko: '활용률', en: 'Utilization' },
    definition: {
      beginner: {
        ko: 'PE들이 실제로 일하고 있는 비율. 100%에 가까울수록 좋음',
        en: 'The percentage of PEs actually doing work. Closer to 100% is better',
      },
      intermediate: {
        ko: '전체 사이클 중 PE가 실제 연산을 수행한 비율. 타일링과 메모리 계층이 활용률을 좌우',
        en: 'The ratio of cycles where PEs actually compute. Tiling and memory hierarchy determine utilization',
      },
      expert: {
        ko: 'util = active_PE_cycles / (total_PEs × total_cycles). 어레이 크기, 타일 크기, 메모리 BW의 함수',
        en: 'util = active_PE_cycles / (total_PEs × total_cycles). Function of array size, tile size, and memory BW',
      },
    },
  },
  roofline: {
    term: { ko: '루프라인 모델', en: 'Roofline Model' },
    definition: {
      beginner: {
        ko: '하드웨어 성능의 한계를 지붕 모양 그래프로 보여주는 분석 도구',
        en: 'An analysis tool that shows hardware performance limits as a roof-shaped graph',
      },
      intermediate: {
        ko: '연산 강도(FLOPs/Byte) 대비 달성 성능(GOPS) 그래프. 메모리 바운드와 컴퓨트 바운드 영역을 시각적으로 구분',
        en: 'Graph of arithmetic intensity (FLOPs/Byte) vs achieved performance (GOPS). Visually separates memory-bound and compute-bound regions',
      },
      expert: {
        ko: 'perf ≤ min(peak_GOPS, BW × AI). Ridge point에서 전환. AccSim은 실측 AI와 달성 GOPS를 플롯',
        en: 'perf ≤ min(peak_GOPS, BW × AI). Transition at ridge point. AccSim plots measured AI and achieved GOPS',
      },
    },
  },
  operationalIntensity: {
    term: { ko: '산술 강도', en: 'Operational Intensity' },
    definition: {
      beginner: {
        ko: '데이터 1바이트당 수행하는 연산 수. 높을수록 계산 집약적',
        en: 'Operations per byte of data. Higher means more compute-intensive',
      },
      intermediate: {
        ko: 'FLOPs/Byte 비율. Roofline 모델의 X축. 메모리 바운드 ↔ 컴퓨트 바운드를 결정하는 핵심 지표',
        en: 'FLOPs/Byte ratio. X-axis of Roofline model. Key metric determining memory-bound vs compute-bound',
      },
      expert: {
        ko: 'AI = 2MNK / (sizeof(dtype) × (MK + KN + MN)). 타일링으로 AI를 ridge point 이상으로 끌어올리는 것이 목표',
        en: 'AI = 2MNK / (sizeof(dtype) × (MK + KN + MN)). Goal is to push AI above ridge point via tiling',
      },
    },
  },
  dataflow: {
    term: { ko: '데이터플로우', en: 'Dataflow' },
    definition: {
      beginner: {
        ko: '데이터가 칩 안에서 이동하는 방식',
        en: 'How data moves through the chip',
      },
      intermediate: {
        ko: '시스톨릭 어레이에서 데이터가 흐르는 패턴. Weight-stationary, Output-stationary, Row-stationary 등',
        en: 'The pattern of data flow in a systolic array. Weight-stationary, Output-stationary, Row-stationary, etc.',
      },
      expert: {
        ko: 'Dataflow는 어떤 operand를 PE에 고정하고 어떤 것을 스트리밍할지 결정. 에너지 효율에 직접적 영향',
        en: 'Dataflow determines which operand is stationary in PE and which streams. Directly impacts energy efficiency',
      },
    },
  },
  tiling: {
    term: { ko: '타일링', en: 'Tiling' },
    definition: {
      beginner: {
        ko: '큰 행렬을 작은 조각으로 나누어 처리하는 기법',
        en: 'Technique of breaking a large matrix into smaller pieces for processing',
      },
      intermediate: {
        ko: '어레이 크기보다 큰 행렬을 NxN 타일로 분할하여 순차 처리. 타일 크기가 활용률과 메모리 접근 패턴을 결정',
        en: 'Splitting matrices larger than array size into NxN tiles for sequential processing. Tile size determines utilization and memory access patterns',
      },
      expert: {
        ko: 'W_hh(256×64): K=64를 array_size=8로 나누면 8개 weight tile. Loop order (M,N,K)가 reuse distance에 영향',
        en: 'W_hh(256×64): K=64 / array_size=8 = 8 weight tiles. Loop order (M,N,K) affects reuse distance',
      },
    },
  },
  ISA: {
    term: { ko: 'ISA (명령어 집합)', en: 'ISA (Instruction Set Architecture)' },
    definition: {
      beginner: {
        ko: '하드웨어가 이해하는 명령어의 목록',
        en: 'The list of commands that hardware understands',
      },
      intermediate: {
        ko: '가속기가 실행할 수 있는 9개 연산 명령어. LOAD_WEIGHT, MATMUL, ACT_SIGMOID 등',
        en: "The 9 operation instructions the accelerator can execute. LOAD_WEIGHT, MATMUL, ACT_SIGMOID, etc.",
      },
      expert: {
        ko: '9-opcode RISC-style ISA. LOAD_WEIGHT/INPUT → MATMUL → STORE → element-wise/activation. 컴파일러가 모델을 이 ISA로 변환',
        en: '9-opcode RISC-style ISA. LOAD_WEIGHT/INPUT → MATMUL → STORE → element-wise/activation. Compiler converts models to this ISA',
      },
    },
  },
  LSTM: {
    term: { ko: 'LSTM', en: 'LSTM' },
    definition: {
      beginner: {
        ko: '시간 순서가 있는 데이터를 처리하는 AI 모델. 기상 예측, 주가 예측 등에 사용',
        en: 'An AI model for sequential data. Used for weather forecasting, stock prediction, etc.',
      },
      intermediate: {
        ko: 'Long Short-Term Memory. 4개 게이트(i,f,g,o)로 장기 기억을 유지하는 순환 신경망. 각 게이트는 행렬 곱셈+활성화 함수로 구성',
        en: 'Long Short-Term Memory. A recurrent neural network with 4 gates (i,f,g,o) maintaining long-term memory. Each gate is matrix multiplication + activation',
      },
      expert: {
        ko: 'gates = W_ih@x_t + W_hh@h_{t-1} + bias → split → sigmoid/tanh → cell/hidden update. SolarX: input=8, hidden=64, seq=24',
        en: 'gates = W_ih@x_t + W_hh@h_{t-1} + bias → split → sigmoid/tanh → cell/hidden update. SolarX: input=8, hidden=64, seq=24',
      },
    },
  },
  sigmoid: {
    term: { ko: '시그모이드', en: 'Sigmoid' },
    definition: {
      beginner: {
        ko: '값을 0~1 사이로 압축하는 함수. "얼마나 통과시킬지" 결정하는 게이트 역할',
        en: 'A function that squashes values between 0 and 1. Acts as a gate deciding "how much to pass through"',
      },
      intermediate: {
        ko: 'σ(x) = 1/(1+e^-x). LSTM의 입력(i), 망각(f), 출력(o) 게이트에 사용. 0~1 범위로 정보 흐름을 제어',
        en: 'σ(x) = 1/(1+e^-x). Used in LSTM input(i), forget(f), output(o) gates. Controls information flow in 0-1 range',
      },
      expert: {
        ko: 'ACT_SIGMOID opcode로 구현. Element-wise 연산이므로 PE 활용률에 미미한 영향. LUT 또는 구간 선형 근사',
        en: 'Implemented as ACT_SIGMOID opcode. Element-wise op with minimal impact on PE utilization. LUT or piecewise linear approximation',
      },
    },
  },
  tanh: {
    term: { ko: '탄젠트(tanh)', en: 'Tanh' },
    definition: {
      beginner: {
        ko: '값을 -1~1 사이로 압축하는 함수. 새로운 정보의 크기를 조절',
        en: 'A function that squashes values between -1 and 1. Adjusts the magnitude of new information',
      },
      intermediate: {
        ko: 'tanh(x) = (e^x - e^-x)/(e^x + e^-x). LSTM의 셀 게이트(g)와 셀 상태 출력에 사용',
        en: 'tanh(x) = (e^x - e^-x)/(e^x + e^-x). Used in LSTM cell gate (g) and cell state output',
      },
      expert: {
        ko: 'ACT_TANH opcode. tanh(x) = 2σ(2x) - 1 관계로 sigmoid HW 재활용 가능',
        en: 'ACT_TANH opcode. tanh(x) = 2σ(2x) - 1 relation allows sigmoid HW reuse',
      },
    },
  },
  pipelineStall: {
    term: { ko: '파이프라인 스톨', en: 'Pipeline Stall' },
    definition: {
      beginner: {
        ko: '다음 데이터를 기다리느라 계산이 멈추는 현상',
        en: 'When computation pauses waiting for the next data',
      },
      intermediate: {
        ko: '메모리 접근 지연이나 데이터 의존성으로 PE가 유휴 상태가 되는 사이클. 스톨이 많으면 활용률이 떨어짐',
        en: 'Cycles where PEs idle due to memory access delays or data dependencies. More stalls mean lower utilization',
      },
      expert: {
        ko: 'Stall = DRAM latency miss + tile boundary flush + dependency hazard. Double buffering과 prefetch로 완화',
        en: 'Stall = DRAM latency miss + tile boundary flush + dependency hazard. Mitigated by double buffering and prefetch',
      },
    },
  },
  weightStationary: {
    term: { ko: 'Weight-Stationary', en: 'Weight-Stationary' },
    definition: {
      beginner: {
        ko: '가중치를 PE에 고정해두고 입력 데이터만 이동시키는 방식',
        en: 'A method where weights are fixed in PEs and only input data moves',
      },
      intermediate: {
        ko: '시스톨릭 어레이의 데이터플로우 방식. 가중치를 PE에 한 번 로드하면 여러 입력에 재사용하여 메모리 접근을 줄임',
        en: 'A dataflow mode of systolic arrays. Weights loaded once into PEs are reused across multiple inputs, reducing memory accesses',
      },
      expert: {
        ko: 'W는 PE local register에 stationary, A는 systolic propagation(L→R), psum은 accumulation(T→B). Google TPU v1과 동일',
        en: 'W stationary in PE local register, A in systolic propagation (L→R), psum in accumulation (T→B). Same as Google TPU v1',
      },
    },
  },
  GEMM: {
    term: { ko: 'GEMM', en: 'GEMM' },
    definition: {
      beginner: {
        ko: '행렬과 행렬을 곱하는 연산. AI의 가장 기본적인 계산',
        en: 'Matrix times matrix operation. The most fundamental computation in AI',
      },
      intermediate: {
        ko: 'General Matrix Multiply. C = A×B 형태. DNN의 선형 레이어, LSTM 게이트, 어텐션 모두 GEMM으로 귀결',
        en: 'General Matrix Multiply. C = A×B form. Linear layers, LSTM gates, attention all reduce to GEMM',
      },
      expert: {
        ko: 'O(MNK) MACs, O(MK+KN+MN) memory. Arithmetic intensity = 2MNK/(sizeof×(MK+KN+MN)). 타일링으로 캐시 재사용 극대화',
        en: 'O(MNK) MACs, O(MK+KN+MN) memory. Arithmetic intensity = 2MNK/(sizeof×(MK+KN+MN)). Maximize cache reuse via tiling',
      },
    },
  },
}
