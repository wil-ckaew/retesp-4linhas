// backend/src/migrations.rs
use sqlx::PgPool;

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::Error> {
    println!("🔄 Executando migrações...");
    
    // Criar extensão UUID
    sqlx::query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        .execute(pool)
        .await?;
    
    // Criar tabela users
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Inserir admin se não existir
    sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            'Administrador',
            'admin@retesp.com',
            '$2b$12$7uTkA8VKjLg5Q1OZzTZ9qO7kR8LmN9pQrS5tUwXyZ6aBcDeFgH4iJ',
            'admin'
        )
        ON CONFLICT (email) DO NOTHING
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela athletes com todos os campos
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS athletes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            birth_date DATE NOT NULL,
            category VARCHAR(50) NOT NULL,
            avatar_url TEXT,
            medical_form_url TEXT,
            phone VARCHAR(20),
            address TEXT,
            neighborhood VARCHAR(100),
            city VARCHAR(100),
            state VARCHAR(2),
            zip_code VARCHAR(10),
            emergency_contact VARCHAR(255),
            emergency_phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela coaches
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS coaches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            specialization VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela teams
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS teams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela attendance
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS attendance (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
            training_date DATE NOT NULL,
            present BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(athlete_id, training_date)
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela media
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS media (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
            file_url TEXT NOT NULL,
            type VARCHAR(20) DEFAULT 'photo',
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela posts
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            author_id UUID REFERENCES users(id) ON DELETE CASCADE,
            team_name VARCHAR(100),
            content TEXT NOT NULL,
            image_url TEXT,
            video_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela likes
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS likes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id)
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela comments
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Criar tabela stories
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS stories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) NOT NULL,
            image TEXT,
            video_url TEXT,
            story_type VARCHAR(20) NOT NULL,
            is_from_retesp BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    // Adicionar colunas se não existirem (para compatibilidade)
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS phone VARCHAR(20)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS address TEXT")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS city VARCHAR(100)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS state VARCHAR(2)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255)")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20)")
        .execute(pool)
        .await?;
    
    // Índices
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_athletes_phone ON athletes(phone)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_athletes_city ON athletes(city)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_athletes_state ON athletes(state)")
        .execute(pool)
        .await?;
    
    println!("✅ Migrações executadas com sucesso!");
    Ok(())
}