CREATE TABLE vehicle_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE manufacturers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    website TEXT
);

CREATE TABLE vehicle_models (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    manufacturer_id BIGINT NOT NULL
        REFERENCES manufacturers(id),
    vehicle_type_id BIGINT NOT NULL
        REFERENCES vehicle_types(id),
    model_name VARCHAR(120) NOT NULL,
    model_year SMALLINT,
    nominal_voltage NUMERIC(6,2),
    UNIQUE NULLS NOT DISTINCT
        (manufacturer_id, vehicle_type_id, model_name, model_year)
);

CREATE TABLE components (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    manufacturer_id BIGINT REFERENCES manufacturers(id),
    component_type VARCHAR(40) NOT NULL,
    model_name VARCHAR(120),
    UNIQUE NULLS NOT DISTINCT
        (manufacturer_id, component_type, model_name)
);

CREATE TABLE fault_codes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    component_id BIGINT REFERENCES components(id),
    code VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'unknown',
    verification_status VARCHAR(20)
        NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE technical_sources (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    manufacturer_id BIGINT REFERENCES manufacturers(id),
    title TEXT NOT NULL,
    document_version VARCHAR(80),
    source_url TEXT,
    accessed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

CREATE TABLE fault_code_sources (
    fault_code_id BIGINT NOT NULL
        REFERENCES fault_codes(id) ON DELETE CASCADE,
    source_id BIGINT NOT NULL
        REFERENCES technical_sources(id),
    page_reference VARCHAR(100),
    evidence_notes TEXT,
    PRIMARY KEY (fault_code_id, source_id)
);

CREATE TABLE fault_procedures (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fault_code_id BIGINT NOT NULL
        REFERENCES fault_codes(id) ON DELETE CASCADE,
    step_number SMALLINT NOT NULL,
    instruction TEXT NOT NULL,
    safety_warning TEXT,
    source_id BIGINT REFERENCES technical_sources(id),
    UNIQUE (fault_code_id, step_number)
);

CREATE INDEX idx_fault_codes_code ON fault_codes(code);
CREATE INDEX idx_vehicle_models_name ON vehicle_models(model_name);

INSERT INTO vehicle_types (name)
VALUES
    ('Bicicleta elétrica'),
    ('Moto elétrica'),
    ('Scooter elétrica')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE fault_code_images (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fault_code_id BIGINT NOT NULL
        REFERENCES fault_codes(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    caption TEXT,
    page_reference VARCHAR(100),
    source_id BIGINT REFERENCES technical_sources(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fault_code_images_fault_code_id
    ON fault_code_images(fault_code_id);

-- Relação entre modelos e códigos aplicáveis.
CREATE TABLE vehicle_model_fault_codes (
    vehicle_model_id BIGINT NOT NULL
        REFERENCES vehicle_models(id) ON DELETE CASCADE,
    fault_code_id BIGINT NOT NULL
        REFERENCES fault_codes(id) ON DELETE CASCADE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    applicability_notes TEXT,
    PRIMARY KEY (vehicle_model_id, fault_code_id)
);

CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(20) NOT NULL
        CHECK (perfil IN ('mecanico', 'revisor', 'admin')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_usuarios_email_lower
    ON usuarios (LOWER(email));

CREATE TABLE clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(160) NOT NULL,
    telefone VARCHAR(40),
    email VARCHAR(254),
    veiculo VARCHAR(180),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atendimentos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_erro VARCHAR(40) NOT NULL,
    fabricante VARCHAR(120) NOT NULL,
    modelo VARCHAR(120) NOT NULL,
    problema_relatado TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto'
        CHECK (status IN ('aberto', 'em_andamento', 'concluido')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_atendimentos_criado_em
    ON atendimentos (criado_em DESC);

CREATE TABLE technical_tests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_model_id BIGINT NOT NULL
        REFERENCES vehicle_models(id),
    fault_code_id BIGINT NOT NULL
        REFERENCES fault_codes(id),
    test_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    test_conditions TEXT,
    procedure_performed TEXT NOT NULL,
    observed_result TEXT NOT NULL,
    outcome VARCHAR(30) NOT NULL DEFAULT 'inconclusivo'
        CHECK (outcome IN ('confirmado_no_teste', 'nao_reproduzido', 'inconclusivo')),
    evidence_notes TEXT,
    evidence_url TEXT,
    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (validation_status IN ('pending', 'under_review', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_technical_tests_model
    ON technical_tests (vehicle_model_id);
CREATE INDEX idx_technical_tests_fault_code
    ON technical_tests (fault_code_id);
CREATE INDEX idx_technical_tests_date
    ON technical_tests (test_date DESC);

CREATE TABLE technical_test_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    technical_test_id BIGINT NOT NULL
        REFERENCES technical_tests(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL
        REFERENCES usuarios(id),
    decision VARCHAR(20) NOT NULL
        CHECK (decision IN ('accepted', 'rejected')),
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_technical_test_reviews_test
    ON technical_test_reviews (technical_test_id, id DESC);
