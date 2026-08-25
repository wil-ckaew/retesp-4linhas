from fastapi import FastAPI
import folium
import json
import asyncpg
import os

app = FastAPI()
DATABASE_URL = os.getenv("DATABASE_URL")

@app.get("/")
def root():
    return {"service": "RETESP Social Service (Mapas e Indicadores)"}

@app.get("/map/{nucleus_id}")
async def get_nucleus_map(nucleus_id: str):
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch("SELECT name, latitude, longitude, total_children, neighborhood FROM nuclei WHERE id = $1", nucleus_id)
    await conn.close()
    
    if not rows:
        return {"error": "Núcleo não encontrado"}
    
    r = rows[0]
    # Gera um mapa interativo com Folium
    map_obj = folium.Map(location=[r['latitude'], r['longitude']], zoom_start=15)
    folium.Marker(
        [r['latitude'], r['longitude']],
        popup=f"{r['name']}<br>{r['neighborhood']}<br>Crianças: {r['total_children']}",
        icon=folium.Icon(color="blue", icon="info-sign")
    ).add_to(map_obj)
    
    return {"map_html": map_obj._repr_html_()}
