"""Pydantic request / response models with camelCase wire format."""

from pydantic import BaseModel, ConfigDict, Field


class PredictRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    designation: int = Field(..., ge=1, le=5, alias="designation")
    resource_allocation: float = Field(
        ..., ge=1, le=10, alias="resourceAllocation"
    )
    mental_fatigue_score: float = Field(
        ..., ge=0, le=10, alias="mentalFatigueScore"
    )


class PredictResponseData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    predicted_burn_rate: float = Field(
        ..., serialization_alias="predictedBurnRate"
    )


class PredictResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    success: bool = True
    data: PredictResponseData


class HealthResponse(BaseModel):
    status: str = "ok"
    model: str
    uptime: float


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
