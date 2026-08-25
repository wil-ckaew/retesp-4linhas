from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from ultralytics import YOLO
import cv2
import os
import json
import redis
import uuid

app = FastAPI()
r = redis.Redis(host='redis', port=6379, decode_responses=True)

# Carrega o modelo YOLO treinado para detecção de pessoas (simulado, pois não temos GPU)
# Em produção, use um modelo treinado especificamente para futebol (ex: modelos da Roboflow)
try:
    model = YOLO("yolov8n.pt")
except:
    model = None

class VideoRequest(BaseModel):
    video_url: str

@app.get("/")
def read_root():
    return {"service": "RETESP Video AI (YOLOv8) - Ready"}

@app.post("/analyze")
async def analyze_video(req: VideoRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    # Adiciona à fila do Redis para processamento assíncrono
    r.set(f"task:{task_id}", "processing")
    background_tasks.add_task(process_video, req.video_url, task_id)
    return {"task_id": task_id, "status": "queued"}

def process_video(video_url, task_id):
    # Simulação de análise (em produção, baixa o vídeo do MinIO e processa frame a frame)
    # Por simulação, geramos um relatório falso com movimentação e destaques
    report = {
        "task_id": task_id,
        "total_players_detected": 22,
        "average_speed_kmh": 12.5,
        "heat_map": "http://localhost:9001/retesp-media/heatmaps/heat_1.png",
        "highlights": [
            {"minute": 15, "description": "Gol de falta. Perfeito."},
            {"minute": 32, "description": "Passe em profundidade."}
        ],
        "radar_skill": {
            "posicionamento": 78,
            "velocidade": 85,
            "passe": 92
        }
    }
    r.set(f"task:{task_id}", json.dumps(report))
    
@app.get("/task/{task_id}")
def get_task(task_id: str):
    result = r.get(f"task:{task_id}")
    if result:
        if result == "processing":
            return {"status": "processing"}
        return {"status": "done", "report": json.loads(result)}
    return {"status": "not_found"}
