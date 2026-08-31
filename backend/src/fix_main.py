import re

# Ler o arquivo original
with open('main.rs', 'r') as f:
    content = f.read()

# Ler a função corrigida
with open('generate_training_fix.rs', 'r') as f:
    new_function = f.read()

# Substituir a função generate_training
# Padrão para encontrar a função
pattern = r'async fn generate_training\([^)]*\)\s*->\s*impl\s+Responder\s*\{[^}]*\}'
# O padrão acima pode não funcionar para funções aninhadas, então usamos uma abordagem diferente

# Encontrar o início da função
start_marker = 'async fn generate_training('
start_pos = content.find(start_marker)
if start_pos == -1:
    print("❌ Função generate_training não encontrada!")
    exit(1)

# Encontrar o final da função (procurando o '}' correspondente)
# Vamos contar chaves
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
