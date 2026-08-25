use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use tokio_postgres::NoTls;
use std::env;
use uuid::Uuid;

#[derive(Deserialize)]
struct TransactionRequest {
    athlete_id: String,
    amount: i32,
    reason: String,
}

#[derive(Serialize)]
struct BalanceResponse {
    athlete_id: String,
    balance: i32,
}

async fn get_balance(path: web::Path<String>) -> impl Responder {
    let db_url = env::var("DATABASE_URL").unwrap();
    let (client, connection) = tokio_postgres::connect(&db_url, NoTls).await.unwrap();
    tokio::spawn(async move { let _ = connection.await; });
    
    let rows = client.query("SELECT balance FROM coins WHERE athlete_id = $1", &[&path.into_inner()]).await;
    if let Ok(rows) = rows {
        if let Some(row) = rows.first() {
            let balance: i32 = row.get(0);
            return HttpResponse::Ok().json(BalanceResponse { athlete_id: "".to_string(), balance });
        }
    }
    HttpResponse::NotFound().body("Atleta não encontrado")
}

async fn add_coins(req: web::Json<TransactionRequest>) -> impl Responder {
    let db_url = env::var("DATABASE_URL").unwrap();
    let (client, connection) = tokio_postgres::connect(&db_url, NoTls).await.unwrap();
    tokio::spawn(async move { let _ = connection.await; });
    
    let update = client.execute(
        "INSERT INTO coins (athlete_id, balance) VALUES ($1, $2) ON CONFLICT (athlete_id) DO UPDATE SET balance = coins.balance + $2",
        &[&req.athlete_id, &req.amount]
    ).await;
    
    if update.is_ok() {
        let _ = client.execute(
            "INSERT INTO coin_transactions (athlete_id, amount, reason) VALUES ($1, $2, $3)",
            &[&req.athlete_id, &req.amount, &req.reason]
        ).await;
        return HttpResponse::Ok().json("Moedas adicionadas com sucesso");
    }
    HttpResponse::InternalServerError().body("Erro ao adicionar moedas")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    println!("💰 RETESP Coin Engine running on port 8004");

    HttpServer::new(|| {
        App::new()
            .route("/balance/{athlete_id}", web::get().to(get_balance))
            .route("/add", web::post().to(add_coins))
    })
    .bind(("0.0.0.0", 8004))?
    .run()
    .await
}
