import re

# Ler o arquivo main.rs
with open('main.rs', 'r') as f:
    content = f.read()

# Definir a nova função generate_training (com fallback de 3 argumentos)
new_function = '''async fn generate_training(req: web::Json<AITrainingRequest>) -> impl Responder {
    let client = ReqwestClient::new();
    let prompt = format!(
        "Crie um plano de treino de futebol detalhado para categoria {}, duracao {}, com objetivo: {}.",
        req.category, req.duration, req.objective
    );
    
    let res = client
        .post(format!("{}/api/generate", get_ollama_url()))
        .json(&serde_json::json!({"model": "qwen2.5:1.5b", "prompt": prompt, "stream": false}))
        .send().await;
    
    match res {
        Ok(r) => {
            if let Ok(json_res) = r.json::<serde_json::Value>().await {
                let response_text = json_res["response"]
                    .as_str()
                    .unwrap_or("")
                    .to_string();
                if !response_text.is_empty() && response_text.len() > 20 {
                    return HttpResponse::Ok().body(response_text);
                }
            }
        }
        Err(e) => {
            eprintln!("❌ Erro Ollama: {}", e);
        }
    }
    
    println!("⚠️ Usando fallback");
    let fallback = format!(
        "TREINO DE {} - {}
Duracao: {}

OBJETIVO
{}

AQUECIMENTO (15 min)
- Corrida leve (5 min)
- Alongamento (5 min)
- Passe curto (5 min)

PARTE PRINCIPAL (60 min)
- Tecnica individual (15 min)
- Trabalho em duplas (20 min)
- Situacoes de jogo (25 min)

FINALIZACAO (15 min)
- Jogo livre

INDICADORES
- Execucao correta
- Tomada de decisao
- Intensidade

RETESP 4L - Formando campeoes!",
        req.objective, req.category, req.duration
    );
    
    HttpResponse::Ok().body(fallback)
}'''

# Encontrar a posição da função generate_training
start_pattern = r'async fn generate_training\s*\([^)]*\)\s*->\s*impl\s+Responder'
match = re.search(start_pattern, content)
if not match:
    print("❌ Função não encontrada!")
    exit(1)

start_pos = match.start()

# Encontrar o final da função (procurando o '}' correspondente)
brace_count = 0
end_pos = start_pos
found_start = False

for i in range(start_pos, len(content)):
    if content[i] == '{':
        brace_count += 1
        if not found_start:
            found_start = True
    elif content[i] == '}':
        brace_count -= 1
        if found_start and brace_count == 0:
            end_pos = i + 1
            break

if end_pos == start_pos:
    print("❌ Não foi possível encontrar o final da função!")
    exit(1)

# Substituir
new_content = content[:start_pos] + new_function + content[end_pos:]

# Salvar
with open('main.rs', 'w') as f:
    f.write(new_content)

print("✅ Função generate_training substituída com sucesso!")
print(f"📍 Posição: {start_pos} até {end_pos}")
