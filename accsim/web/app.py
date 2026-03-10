"""FastAPI web dashboard for AccSim."""
from __future__ import annotations
import os
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .simulator_api import (
    get_hardware_config,
    run_matmul_demo,
    run_lstm_demo,
    run_solarx_demo,
)

app = FastAPI(title="AccSim Dashboard", version="0.1.0")

_allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint for Render."""
    return JSONResponse({"status": "ok"})


@app.get("/api/config")
async def api_config(
    array_size: int = Query(8, ge=2, le=32),
    clock_ghz: float = Query(1.0, ge=0.1, le=4.0),
):
    """Return hardware configuration."""
    return get_hardware_config(array_size, clock_ghz)


@app.get("/api/demo/matmul")
async def api_matmul(
    array_size: int = Query(8, ge=2, le=32),
    m: int = Query(8, ge=1, le=256),
    k: int = Query(8, ge=1, le=256),
    n: int = Query(8, ge=1, le=256),
    clock_ghz: float = Query(1.0, ge=0.1, le=4.0),
):
    """Run matrix multiplication demo."""
    return run_matmul_demo(array_size, m, k, n, clock_ghz)


@app.get("/api/demo/lstm")
async def api_lstm(
    clock_ghz: float = Query(1.0, ge=0.1, le=4.0),
):
    """Run tiny LSTM demo."""
    return run_lstm_demo(array_size=4, clock_ghz=clock_ghz)


@app.get("/api/demo/solarx")
async def api_solarx(
    clock_ghz: float = Query(1.0, ge=0.1, le=4.0),
):
    """Run SolarX LSTM demo."""
    return run_solarx_demo(clock_ghz=clock_ghz)


class RunRequest(BaseModel):
    array_size: int = 8
    batch_size: int = 1
    seq_len: int = 24
    precision: str = "fp32"
    model_type: str = "lstm"
    m: Optional[int] = None
    k: Optional[int] = None
    n: Optional[int] = None


@app.post("/api/run")
async def run_simulation(req: RunRequest):
    """Run simulation with custom parameters, return normalized frontend schema."""
    try:
        if req.model_type == "matmul" and req.m and req.k and req.n:
            result = run_matmul_demo(
                array_size=req.array_size,
                m=req.m,
                k=req.k,
                n=req.n,
            )
        else:
            result = run_lstm_demo(
                array_size=req.array_size,
                seq_len=req.seq_len,
                batch_size=req.batch_size,
            )

        metrics = result.get("metrics", {})
        config_d = result.get("config", {})
        breakdown = metrics.get("cycle_breakdown", {})
        timeline_raw = result.get("timeline", [])

        # Normalize timeline to frontend schema
        timeline = []
        for entry in timeline_raw:
            timeline.append({
                "opcode": entry.get("opcode", ""),
                "opcode_kr": entry.get("opcode_kr", entry.get("opcode", "")),
                "start_cycle": entry.get("start_cycle", 0),
                "end_cycle": entry.get("end_cycle", 0),
                "cycles": entry.get("cycles", 0),
                "comment": entry.get("comment", ""),
            })

        # Normalize breakdown keys
        normalized_breakdown = {
            "compute": (
                breakdown.get("matmul", 0)
                + breakdown.get("MatMul (ih)", 0)
                + breakdown.get("MatMul (hh)", 0)
            ),
            "memory": breakdown.get("memory", 0),
            "activation": (
                breakdown.get("activation", 0)
                + breakdown.get("Activation", 0)
            ),
            "stall": breakdown.get("elementwise", 0) + breakdown.get("Elementwise", 0),
        }

        return {
            "total_cycles": metrics.get("total_cycles", 0),
            "utilization": metrics.get("pe_utilization", 0),
            "roofline_point": {
                "operational_intensity": metrics.get("arithmetic_intensity", 0),
                "performance": metrics.get("achieved_gops", 0),
                "is_compute_bound": metrics.get("arithmetic_intensity", 0)
                >= config_d.get("ridge_point_ops_per_byte", 4.0),
            },
            "heatmap_matrix": result.get("pe_heatmap", []),
            "breakdown": normalized_breakdown,
            "timeline": timeline,
            "config": {
                "array_size": config_d.get("array_size", req.array_size),
                "clock_freq_hz": config_d.get("clock_freq_hz", 1_000_000_000),
                "peak_gops": config_d.get("peak_gops", 0),
                "dram_bandwidth_gbps": config_d.get("dram_bandwidth_gbps", 25.6),
            },
            "metrics": metrics,
            "animation_frames": result.get("animation_frames", []),
            "error": None,
        }
    except Exception as e:
        return {"error": str(e), "total_cycles": 0}


@app.post("/api/run/matmul")
async def run_matmul(req: RunRequest):
    """Run custom matrix multiplication and return normalized schema."""
    req.model_type = "matmul"
    return await run_simulation(req)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("accsim.web.app:app", host="0.0.0.0", port=8080, reload=True)
