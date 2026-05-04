"""
FastAPI application — burnout prediction microservice.

Endpoints:
    POST /api/predict   — predict burn rate from 3 features
    GET  /api/health    — health check (primary)
    GET  /health        — health check (alias)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .predict import get_uptime, load_model, predict_burn_rate
from .schemas import (
    ErrorResponse,
    ErrorDetail,
    HealthResponse,
    PredictRequest,
    PredictResponse,
    PredictResponseData,
)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — loading model eagerly")
    load_model()
    logger.info("Model ready, accepting requests")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="Burnout Prediction Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_req: Request, exc: RequestValidationError):
    messages = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err["loc"])
        messages.append(f"{loc}: {err['msg']}")
    body = ErrorResponse(
        error=ErrorDetail(code="VALIDATION_ERROR", message="; ".join(messages))
    )
    return JSONResponse(status_code=422, content=body.model_dump())


@app.exception_handler(Exception)
async def generic_error_handler(_req: Request, exc: Exception):
    logger.exception("Unhandled error")
    body = ErrorResponse(
        error=ErrorDetail(code="INTERNAL_ERROR", message=str(exc))
    )
    return JSONResponse(status_code=500, content=body.model_dump())


@app.post("/api/predict")
async def predict(req: PredictRequest):
    burn_rate = predict_burn_rate(
        designation=req.designation,
        resource_allocation=req.resource_allocation,
        mental_fatigue_score=req.mental_fatigue_score,
    )
    resp = PredictResponse(
        data=PredictResponseData(predicted_burn_rate=burn_rate)
    )
    return JSONResponse(content=resp.model_dump(by_alias=True))


@app.get("/api/health", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse, include_in_schema=False)
async def health():
    return HealthResponse(
        model=settings.MODEL_NAME,
        uptime=get_uptime(),
    )
