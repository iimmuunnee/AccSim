"""Korean localization, metric descriptions, and baseline comparisons."""

# ISA opcode Korean translations
OPCODE_KR = {
    'LOAD_WEIGHT': '가중치 로드',
    'LOAD_INPUT': '입력 로드',
    'MATMUL': '행렬 곱셈',
    'STORE': '저장',
    'ACT_SIGMOID': '시그모이드 활성화',
    'ACT_TANH': '하이퍼탄젠트 활성화',
    'ELEM_MUL': '원소별 곱셈',
    'ELEM_ADD': '원소별 덧셈',
    'NOP': '대기',
}

# Cycle breakdown category labels
CYCLE_CATEGORY_KR = {
    'matmul': '행렬 연산',
    'memory': '메모리 접근',
    'activation': '활성화 함수',
    'elementwise': '원소별 연산',
    'MatMul (ih)': '행렬 연산 (입력→은닉)',
    'MatMul (hh)': '행렬 연산 (은닉→은닉)',
    'Activation': '활성화 함수',
    'Elementwise': '원소별 연산',
}

# Metric labels and descriptions
METRIC_LABELS = {
    'total_cycles': {
        'label': '총 사이클',
        'desc': '시뮬레이션에 소요된 전체 클럭 사이클 수',
    },
    'pe_utilization': {
        'label': 'PE 활용률',
        'desc': 'Processing Element가 실제 연산에 사용된 비율',
    },
    'achieved_gops': {
        'label': '달성 성능 (GOPS)',
        'desc': '초당 10억 연산 (Giga Operations Per Second)',
    },
    'instruction_count': {
        'label': '명령어 수',
        'desc': '실행된 총 명령어 개수',
    },
    'arithmetic_intensity': {
        'label': '연산 집약도',
        'desc': '바이트당 연산 수 (Ops/Byte) — Roofline 모델의 X축',
    },
}

# Hardware config Korean labels
CONFIG_LABELS = {
    'array_size': '어레이 크기',
    'clock_freq_hz': '클럭 주파수',
    'data_width': '데이터 폭',
    'sram_input_size': '입력 SRAM',
    'sram_weight_size': '가중치 SRAM',
    'sram_output_size': '출력 SRAM',
    'dram_bandwidth': 'DRAM 대역폭',
    'dram_latency': 'DRAM 지연',
    'peak_gops': '이론 최대 성능',
    'peak_ops_per_cycle': '사이클당 최대 연산',
}


def utilization_grade(util: float) -> dict:
    """Return grade and color for PE utilization percentage."""
    if util > 0.70:
        return {'grade': '우수', 'color': '#00ff88', 'advice': '높은 활용률입니다. 어레이를 효율적으로 사용하고 있습니다.'}
    elif util > 0.40:
        return {'grade': '보통', 'color': '#ffaa00', 'advice': 'batch 크기를 늘리거나 타일 크기를 조절하면 개선됩니다.'}
    else:
        return {'grade': '개선 필요', 'color': '#ff6b35', 'advice': '행렬 크기가 어레이 크기보다 작아 PE가 유휴 상태입니다. batch 처리를 권장합니다.'}


def estimate_cpu_speedup(total_cycles: int, clock_freq_hz: float,
                         total_ops: int) -> dict:
    """Estimate speedup vs a baseline CPU (no SIMD, single core).

    Baseline: 1 MAC = ~5 cycles on a generic 3 GHz CPU (no SIMD).
    This is a rough estimate for demonstration purposes.
    """
    cpu_freq = 3.0e9  # 3 GHz baseline CPU
    cpu_cycles_per_mac = 5  # no SIMD, naive implementation
    cpu_total_cycles = total_ops * cpu_cycles_per_mac
    cpu_time_s = cpu_total_cycles / cpu_freq

    accel_time_s = total_cycles / clock_freq_hz

    speedup = cpu_time_s / accel_time_s if accel_time_s > 0 else 0
    return {
        'speedup': round(speedup, 1),
        'cpu_time_us': cpu_time_s * 1e6,
        'accel_time_us': accel_time_s * 1e6,
        'note': 'SIMD 미사용 단일 코어 CPU (3 GHz) 기준 추정치',
    }


def format_time(cycles: int, clock_freq_hz: float) -> str:
    """Format cycle count as human-readable time."""
    seconds = cycles / clock_freq_hz
    if seconds < 1e-6:
        return f"{seconds * 1e9:.2f} ns"
    elif seconds < 1e-3:
        return f"{seconds * 1e6:.3f} μs"
    elif seconds < 1:
        return f"{seconds * 1e3:.3f} ms"
    return f"{seconds:.3f} s"


def format_bytes(n: int) -> str:
    """Format byte count as KB/MB."""
    if n >= 1024 * 1024:
        return f"{n / (1024*1024):.0f} MB"
    if n >= 1024:
        return f"{n / 1024:.0f} KB"
    return f"{n} B"


def format_bandwidth(bw: float) -> str:
    """Format bandwidth in GB/s."""
    return f"{bw / 1e9:.1f} GB/s"


def build_korean_summary(metrics_dict: dict, config_dict: dict) -> dict:
    """Build a full Korean-language summary of simulation results."""
    util = metrics_dict['pe_utilization']
    grade = utilization_grade(util)

    total_cycles = metrics_dict['total_cycles']
    clock_freq = config_dict['clock_freq_hz']
    time_str = format_time(total_cycles, clock_freq)

    total_ops = metrics_dict.get('total_ops', 0)
    cpu = estimate_cpu_speedup(total_cycles, clock_freq, total_ops)

    peak_gops = config_dict['peak_gops']
    achieved = metrics_dict['achieved_gops']
    peak_pct = (achieved / peak_gops * 100) if peak_gops > 0 else 0

    return {
        'time_str': time_str,
        'util_grade': grade,
        'cpu_speedup': cpu,
        'peak_pct': round(peak_pct, 1),
        'descriptions': {
            'cycles': f"{clock_freq/1e9:.0f} GHz 기준 {time_str} 소요. CPU 대비 약 {cpu['speedup']}배 빠릅니다 (추정).",
            'utilization': f"PE 활용률이 {util:.1%}입니다 — {grade['grade']} 수준. {grade['advice']}",
            'performance': f"이론 최대 {peak_gops:.1f} GOPS 중 {achieved:.2f} GOPS 달성 ({peak_pct:.1f}%).",
        },
        'cycle_breakdown_kr': {
            CYCLE_CATEGORY_KR.get(k, k): v
            for k, v in metrics_dict.get('cycle_breakdown', {}).items()
        },
    }
