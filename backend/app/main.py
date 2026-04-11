from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import configurations and routes
from .core.config import settings
from .core.database import engine, Base
from .api.v1.routes import router as api_v1_router
from .api.v1.auth import router as auth_router

# 1. Initialize the Database (Create tables if they don't exist)
Base.metadata.create_all(bind=engine)

# 2. Create the FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 3. Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include API Routes (Using prefixes for versioning)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(api_v1_router, prefix=settings.API_V1_STR, tags=["core"])

# 5. Root endpoint (Basic health check)
@app.get("/")
def read_root():
    return {"status": "Liminal AI Backend is running successfully."}

# Entry point for running the application directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)