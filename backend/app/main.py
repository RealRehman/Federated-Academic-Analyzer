from app.api.experiment_routes import router as experiment_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.prediction_routes import router as prediction_router

app = FastAPI(
    title="Federated Academic Analyzer",
    description="Privacy-preserving federated academic prediction system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(experiment_router)
app.include_router(prediction_router)


@app.get("/")
def root():
    return {
        "message": "Federated Academic Analyzer API is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "central-server"
    }
