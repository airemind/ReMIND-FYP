import re
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# Register
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "patient"

    # Username Validation
    @field_validator("username")
    @classmethod
    def validate_username(cls, value):
        pattern = r"^[A-Za-z0-9._-]+$"
        if not re.match(pattern, value):
            raise ValueError("Username can only contain letters, numbers, ., _ and -")
        return value

    # Password Validation
    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain lowercase letter")

        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain uppercase letter")

        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain number")

        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain special character")

        return value


# Login
class UserLogin(BaseModel):
    username: str
    password: str


# Google OAuth
class GoogleAuthRequest(BaseModel):
    token: str
    role: str = "patient"
    relationship_type: Optional[str] = None
    patient_id: Optional[int] = None


# Response
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str = "patient"

    class Config:
        from_attributes = True
