from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
import json
import redis

app = FastAPI()
r = redis.Redis(host='redis', port=6379, decode_responses=True)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434")

class TrainingRequest(BaseModel):
    category: str
    duration: str
    objective: str

class VideoRequest(BaseModel):
    video_url: str

@app.on_event("startup")
async def startup_event():
    # Inicializa o Qwen2.5 no Ollama se não existir (apenas na primeira vez)
    try:
        res = requests.post(f"{OLLAMA_HOST}/api/pull", json={"model": "qwen2.5"}, timeout=300)
        print("Qwen2.5 baixado/iniciado com sucesso.")
    except Exception as e:
        print(f"Erro ao puxar modelo Qwen: {e}")

@app.get("/")
def read_root():
    return {"message": "RETESP AI Service (Ollama + Qwen2.5)"}

@app.post("/generate_training")
def generate_training(req: TrainingRequest):
    prompt = f"Crie um treino de futebol para a categoria {req.category}, duração {req.duration}, objetivo: {req.objective}. Seja detalhado."
    try:
        payload = {"model": "qwen2.5", "prompt": prompt, "stream": False}
        res = requests.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=60)
        if res.status_code == 200:
            return res.json()["response"]
        return "Erro na geração do treino."
    except Exception as e:
        return f"Falha de comunicação com Ollama: {e}"
