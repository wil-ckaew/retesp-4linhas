#!/bin/bash
# Corrigir a função generate_training no main.rs

cd ~/rust/v1/retesp-4linhas/backend/src

# Fazer backup
cp main.rs main.rs.backup.2

# Usar sed para substituir a função inteira
sed -i '/^async fn generate_training/,/^}/c\
async fn generate_training(req: web::Json<AITrainingRequest>) -> impl Responder {\
    println!("📝 Gerando treino para: {} - {} - {}", req.category, req.duration, req.objective);\
    \
    let client = ReqwestClient::new();\
    let prompt = format!(\
        "Crie um plano de treino de futebol detalhado para categoria {}, duração {}, com objetivo: {}.",\
        req.category, req.duration, req.objective\
    );\
    \
    let models = vec!["qwen2.5:1.5b", "qwen2.5"];\
    \
    for model in models {\
        println!("🔄 Tentando modelo: {}", model);\
        let res = client\
            .post("http://ollama:11434/api/generate")\
            .json(&serde_json::json!({\
                "model": model,\
                "prompt": prompt,\
                "stream": false,\
                "temperature": 0.7,\
            }))\
            .timeout(std::time::Duration::from_secs(60))\
            .send()\
            .await;\
        \
        match res {\
            Ok(r) => {\
                if r.status().is_success() {\
                    if let Ok(json_res) = r.json::<serde_json::Value>().await {\
                        let response_text = json_res["response"]\
                            .as_str()\
                            .unwrap_or("")\
                            .to_string();\
                        if !response_text.is_empty() && response_text.len() > 20 {\
                            println!("✅ Sucesso com modelo: {}", model);\
                            return HttpResponse::Ok().body(response_text);\
                        }\
                    }\
                }\
            }\
            Err(e) => {\
                eprintln!("❌ Erro com modelo {}: {}", model, e);\
            }\
        }\
    }\
    \
    println!("⚠️ Usando fallback para treino");\
    let fallback = format!(\
        "🏆 TREINO DE {} - {}\\n📅 Duração: {}\\n\\n🎯 OBJETIVO\\n{}\\n\\n📋 ESTRUTURA DO TREINO\\n\\n1️⃣ AQUECIMENTO (15 min)\\n- Corrida leve com mudanças de direção (5 min)\\n- Alongamento dinâmico (5 min)\\n- Passe curto em duplas (5 min)\\n\\n2️⃣ PARTE PRINCIPAL (60 min)\\n\\n🔹 Exercício 1: Técnica individual (15 min)\\n- Condução e controle de bola\\n- Mudanças de direção e velocidade\\n\\n🔹 Exercício 2: Trabalho em duplas (20 min)\\n- Passe, recepção e movimentação\\n- Combinações e tabelas\\n\\n🔹 Exercício 3: Situações de jogo (25 min)\\n- Jogo em espaço reduzido\\n- Aplicação dos fundamentos\\n\\n3️⃣ FINALIZAÇÃO (15 min)\\n- Jogo livre\\n- Ênfase no que foi trabalhado\\n\\n📊 INDICADORES DE SUCESSO\\n✅ Execução correta dos fundamentos\\n✅ Tomada de decisão\\n✅ Intensidade e concentração\\n\\n💡 DICA DO TÉCNICO\\n'\''Cada treino é uma oportunidade de evoluir. Dê o seu máximo!'\''\\n\\n🏆 RETESP 4L - Formando campeões!",\
        req.objective, req.category, req.duration\
    );\
    \
    HttpResponse::Ok().body(fallback)\
}' main.rs

echo "✅ Função generate_training corrigida!"
