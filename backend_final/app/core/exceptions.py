from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException


async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code, content={"success": False, "error": exc.detail}
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        # Wrap exc.errors() with jsonable_encoder
        content={"detail": jsonable_encoder(exc.errors())},
    )


async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500, content={"success": False, "error": "Internal Server Error"}
    )
