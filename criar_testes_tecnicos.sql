
BEGIN;

CREATE TABLE IF NOT EXISTS technical_tests (
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
        CHECK (
            outcome IN (
                'confirmado_no_teste',
                'nao_reproduzido',
                'inconclusivo'
            )
        ),

    evidence_notes TEXT,
    evidence_url TEXT,

    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            validation_status IN (
                'pending',
                'under_review',
                'accepted',
                'rejected'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_technical_tests_model
    ON technical_tests(vehicle_model_id);

CREATE INDEX IF NOT EXISTS idx_technical_tests_fault_code
    ON technical_tests(fault_code_id);

CREATE INDEX IF NOT EXISTS idx_technical_tests_date
    ON technical_tests(test_date DESC);

COMMIT;
