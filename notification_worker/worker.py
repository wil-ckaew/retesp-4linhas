import redis
import asyncio
import asyncpg
import os
import time

REDIS_URL = os.getenv("REDIS_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

async def process_notifications():
    r = redis.from_url(REDIS_URL, decode_responses=True)
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("🚀 Notification Worker iniciado...")
    while True:
        # Aguarda uma notificação na fila do Redis
        task = r.brpop("notifications:queue", timeout=5)
        if task:
            message = task[1]
            print(f"📨 Enviando notificação: {message}")
            # Simula o disparo via WhatsApp/Telegram (Aqui você pode integrar a API do Twilio ou WPPConnect)
            time.sleep(0.5)
            print("✅ Notificação enviada com sucesso!")

if __name__ == "__main__":
    asyncio.run(process_notifications())
