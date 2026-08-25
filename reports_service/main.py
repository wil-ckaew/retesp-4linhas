from fastapi import FastAPI
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
import asyncpg
import os
import io

app = FastAPI()
DATABASE_URL = os.getenv("DATABASE_URL")

@app.get("/")
def root():
    return {"service": "RETESP Reports Service"}

@app.get("/generate_scout_pdf/{athlete_id}")
async def generate_scout_report(athlete_id: str):
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch("SELECT name, category, social_score, tech_score FROM athletes WHERE id = $1", athlete_id)
    await conn.close()
    
    if not rows:
        return {"error": "Atleta não encontrado"}
    
    r = rows[0]
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    c.drawString(30, height - 30, "RELATÓRIO DE SCOUT RETESP")
    c.line(30, height - 35, width - 30, height - 35)
    
    c.drawString(30, height - 60, f"Atleta: {r['name']}")
    c.drawString(30, height - 80, f"Categoria: {r['category']}")
    c.drawString(30, height - 100, f"Nota Técnica: {r['tech_score']}/100")
    c.drawString(30, height - 120, f"Nota Social: {r['social_score']}/100")
    
    c.save()
    pdf_data = buffer.getvalue()
    return {"pdf_base64": pdf_data.hex()}
