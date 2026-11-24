from app.api.experiment_routes import router as experiment_router
from fastapi import FastAPI

app = FastAPI(
    title="Federated Academic Analyzer",
    description="Privacy-preserving federated academic prediction system",
    version="1.0.0"
)
app.include_router(experiment_router)


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
