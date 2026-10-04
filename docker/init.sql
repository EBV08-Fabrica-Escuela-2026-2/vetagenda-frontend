-- =============================================
-- VETAGENDA — Script de inicialización Docker
-- Combina migraciones V1 a V7 en orden
-- =============================================

-- =============================================
-- V1: Creación de tablas base y datos de prueba
-- =============================================

DROP TABLE IF EXISTS servicio CASCADE;
DROP TABLE IF EXISTS veterinario CASCADE;

CREATE TABLE veterinario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    horario_atencion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicio (
    id BIGSERIAL PRIMARY KEY,
    veterinario_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_servicio_veterinario
        FOREIGN KEY (veterinario_id)
        REFERENCES veterinario(id)
        ON DELETE CASCADE
);

-- =============================================
-- V2: Añadir documento_identidad y correo a veterinario
-- =============================================

ALTER TABLE veterinario
ADD COLUMN documento_identidad VARCHAR(20),
ADD COLUMN correo VARCHAR(150);

-- =============================================
-- V3: Crear tabla cliente
-- =============================================

CREATE TABLE cliente (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    documento_identidad VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cliente_documento UNIQUE (documento_identidad),
    CONSTRAINT uq_cliente_correo UNIQUE (correo)
);

-- =============================================
-- V4: Crear tabla mascota
-- =============================================

CREATE TABLE mascota (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    especie VARCHAR(100) NOT NULL,
    raza VARCHAR(100) NOT NULL,
    edad INTEGER NOT NULL CHECK (edad >= 0),
    observaciones VARCHAR(500),
    cliente_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mascota_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES cliente(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_mascota_cliente_id ON mascota(cliente_id);

-- =============================================
-- V5: Añadir tipo_documento, tarjeta_profesional, especialidad a veterinario
-- =============================================

ALTER TABLE veterinario
ADD COLUMN tipo_documento VARCHAR(20),
ADD COLUMN tarjeta_profesional VARCHAR(50),
ADD COLUMN especialidad VARCHAR(100);

-- =============================================
-- V6: Añadir sexo a mascota
-- =============================================

ALTER TABLE mascota
    ADD COLUMN sexo VARCHAR(20) NOT NULL DEFAULT 'Macho'
    CHECK (sexo IN ('Hembra', 'Macho'));

-- =============================================
-- V7: Añadir duracion_minutos a servicio
-- =============================================

ALTER TABLE servicio
    ADD COLUMN duracion_minutos INTEGER NOT NULL DEFAULT 30;

-- =============================================
-- Datos de prueba (veterinarios con constraints satisfechos)
-- =============================================

INSERT INTO veterinario (nombre, documento_identidad, correo, telefono, direccion, horario_atencion, tipo_documento, tarjeta_profesional, especialidad)
VALUES ('Dr. Carlos Pérez', '1012345001', 'carlos.perez@veterinaria.com', '3101234567', 'Calle 10 #5-20, Bogotá', '8:00 AM - 6:00 PM', 'CC', 'TP-123456-VET', 'Medicina General');

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (1, 'Consulta General', 'Revisión completa del paciente', 85000.00, 30);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (1, 'Vacunación', 'Aplicación de vacunas al paciente', 45000.00, 20);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (1, 'Cirugía Mayor', 'Procedimiento quirúrgico complejo', 350000.00, 120);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (1, 'Desparasitación', 'Tratamiento antiparasitario interno y externo', 35000.00, 15);

INSERT INTO veterinario (nombre, documento_identidad, correo, telefono, direccion, horario_atencion, tipo_documento, tarjeta_profesional, especialidad)
VALUES ('Dra. María López', '1012345002', 'maria.lopez@veterinaria.com', '3159876543', 'Carrera 8 #12-34, Medellín', '9:00 AM - 5:00 PM', 'CC', 'TP-234567-VET', 'Dermatología');

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (2, 'Dermatología', 'Tratamiento de problemas de piel', 120000.00, 45);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (2, 'Odontología', 'Limpieza y tratamiento dental', 150000.00, 60);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (2, 'Ecografía', 'Examen de ultrasonido', 95000.00, 30);

INSERT INTO veterinario (nombre, documento_identidad, correo, telefono, direccion, horario_atencion, tipo_documento, tarjeta_profesional, especialidad)
VALUES ('Dr. Andrés Martínez', '1012345003', 'andres.martinez@veterinaria.com', '3204567890', 'Avenida 5 #20-15, Cali', '10:00 AM - 4:00 PM', 'CC', 'TP-345678-VET', 'Cirugía');

INSERT INTO veterinario (nombre, documento_identidad, correo, telefono, direccion, horario_atencion, tipo_documento, tarjeta_profesional, especialidad)
VALUES ('Dra. Laura Rodríguez', '1012345004', 'laura.rodriguez@veterinaria.com', '3012345678', 'Calle 72 #10-25, Bogotá', '7:00 AM - 3:00 PM', 'CC', 'TP-456789-VET', 'Cardiología');

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (4, 'Cirugía Cardíaca', 'Procedimiento cardíaco especializado', 2500000.00, 180);

INSERT INTO servicio (veterinario_id, nombre, descripcion, precio, duracion_minutos)
VALUES (4, 'Rehabilitación', 'Terapia física y rehabilitación', 180000.00, 60);
