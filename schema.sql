-- ========================================================================
-- Script SQL Otimizado para Percona Server 5.7.44 / MySQL 5.7
-- Servidor: Localhost via UNIX socket (cPanel)
-- Usuário: stateres / stateres_home
-- Banco de dados: stateres_home
-- Charset: UTF-8 Unicode (utf8mb4) / InnoDB DYNAMIC
-- ========================================================================

-- Criação do banco de dados (caso esteja criando manualmente com usuário root ou no cPanel)
CREATE DATABASE IF NOT EXISTS `stateres_home` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `stateres_home`;

-- 1. Tabela de Administradores (Compatível com Percona 5.7)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Ferramentas e Atalhos de Acesso Rápido
CREATE TABLE IF NOT EXISTS `tools` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `icon_key` VARCHAR(50) DEFAULT 'globe',
  `category` VARCHAR(100) NOT NULL DEFAULT 'Educação Inclusiva & PEI',
  `is_pinned` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 99,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  INDEX `idx_category` (`category`),
  INDEX `idx_pinned` (`is_pinned`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Inserção do Super Admin (ivan@profesorivan.com.br / 123@mudar)
INSERT INTO `admins` (`name`, `email`, `password_hash`, `role`)
VALUES (
  'Prof. Ivan (Super Admin)',
  'ivan@profesorivan.com.br',
  -- SHA-256 de '123@mudar'
  '93082ff9b55cff94ee7f4d728013baa1863409cf3e5873d3f639aa9238bdb4de',
  'super_admin'
)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `password_hash` = VALUES(`password_hash`);

-- 4. Inserção inicial das ferramentas dos Professores e Funcionários (incluindo SuperPei)
INSERT INTO `tools` (`id`, `name`, `description`, `url`, `image_url`, `icon_key`, `category`, `is_pinned`, `display_order`, `created_at`, `updated_at`)
VALUES
(
  'tool-superpei',
  'SuperPei',
  'Ferramenta para criação, edição, cadastro e acompanhamento pedagógico de estudantes e estudantes neurodivergentes (PEI / AEE).',
  'https://pei.sistemaedutech.com.br/login',
  NULL,
  'sparkles',
  'Educação Inclusiva & PEI',
  1,
  1,
  1704067200000,
  1704067200000
),
(
  'tool-diario-eletronico',
  'Diário de Classe & Notas',
  'Lançamento de frequências diárias, notas bimestrais, pareceres pedagógicos e planos de aula dos professores.',
  'https://diario.esantateresinha.com.br',
  NULL,
  'book-open',
  'Pedagógico & Diários',
  1,
  2,
  1704067200000,
  1704067200000
),
(
  'tool-google-classroom',
  'Google Classroom (Docente)',
  'Painel do professor: turmas atribuídas, postagem de atividades, correção de trabalhos e Google Meet.',
  'https://classroom.google.com',
  NULL,
  'graduation-cap',
  'Salas Virtuais & Aulas',
  1,
  3,
  1704067200000,
  1704067200000
),
(
  'tool-gestao-academica',
  'Sistema de Gestão Escolar (SGE)',
  'Acesso para coordenação e funcionários: enturmação, quadro de horários de aulas, atas e relatórios oficiais.',
  'https://gestao.esantateresinha.com.br',
  'https://esantateresinha.com.br/assets/logo-est.png',
  'layout-grid',
  'Gestão & Secretaria',
  1,
  4,
  1704067200000,
  1704067200000
),
(
  'tool-email-institucional',
  'E-mail Corporativo (@esantateresinha)',
  'Acesso ao webmail institucional e ferramentas Google Workspace para comunicação interna da equipe escolar.',
  'https://mail.google.com/a/esantateresinha.com.br',
  'https://esantateresinha.com.br/assets/logo-est.png',
  'mail',
  'Comunicação & Colaboração',
  0,
  5,
  1704067200000,
  1704067200000
),
(
  'tool-portal-rh',
  'Portal do Colaborador & RH',
  'Acesso para professores e funcionários: consulta de holerites, informes de rendimento, ponto e avisos do RH.',
  'https://rh.esantateresinha.com.br',
  NULL,
  'users',
  'Gestão & Secretaria',
  0,
  6,
  1704067200000,
  1704067200000
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
