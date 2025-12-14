# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance named 'app' (uvicorn looks for this)
app = FastAPI(title="LearnPath AI Backend")

# Simple CORS for local dev; add your frontend origins if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to include the recommendations router if it exists.
# This keeps the main app robust if the router file hasn't been created yet.
try:
    from app.api.routes.recommendations import router as recommendations_router
    app.include_router(recommendations_router)
except Exception as e:
    # Log to console for dev; in production use proper logging
    print("Warning: recommendations router not included:", e)

# A simple root endpoint so you can see the app is live
@app.get("/", tags=["root"])
def read_root():
    return {"status": "ok", "message": "LearnPath AI backend is running"}

