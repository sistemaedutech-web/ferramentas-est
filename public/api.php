<?php
/**
 * Backend API PHP 8.4 + mysqli para Percona Server 5.7 / cPanel
 * Escola Santa Teresinha - Portal de Acesso Rápido
 * https://home.esantateresinha.com.br/
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações do Banco de Dados MySQL (Percona 5.7 via UNIX socket)
$DB_HOST = getenv('MYSQL_HOST') ?: 'localhost';
$DB_USER = getenv('MYSQL_USER') ?: 'stateres_home'; // ou 'stateres' conforme cPanel
$DB_PASS = getenv('MYSQL_PASSWORD') ?: '';
$DB_NAME = getenv('MYSQL_DATABASE') ?: 'stateres_home';

// Credenciais Super Admin
define('SUPER_ADMIN_EMAIL', 'ivan@profesorivan.com.br');
define('SUPER_ADMIN_PASS', '123@mudar');

// Conexão MySQL com suporte a PHP 8.4 e mysqli
function getDbConnection() {
    global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME;
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    if ($conn->connect_errno) {
        return null;
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Rota: Status da Conexão
if ($action === 'status') {
    $conn = getDbConnection();
    echo json_encode([
        'server' => 'Percona Server 5.7.44',
        'php_version' => PHP_VERSION,
        'connected' => $conn !== null,
        'database' => $DB_NAME,
        'user' => $DB_USER,
        'super_admin' => SUPER_ADMIN_EMAIL
    ]);
    exit;
}

// Rota: Login do Super Admin
if ($action === 'login') {
    $email = trim(strtolower($input['email'] ?? ''));
    $pass = trim($input['password'] ?? '');

    if (($email === strtolower(SUPER_ADMIN_EMAIL) || $email === 'canalprofessorivan@gmail.com') && $pass === SUPER_ADMIN_PASS) {
        echo json_encode([
            'success' => true,
            'admin' => [
                'name' => 'Prof. Ivan (Super Admin)',
                'email' => SUPER_ADMIN_EMAIL,
                'role' => 'super_admin'
            ]
        ]);
        exit;
    }

    // Verificar no MySQL se conectado
    $conn = getDbConnection();
    if ($conn) {
        $hash = hash('sha256', $pass);
        $stmt = $conn->prepare("SELECT id, name, email, role, password_hash FROM admins WHERE LOWER(email) = ? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                if ($row['password_hash'] === $hash || $pass === SUPER_ADMIN_PASS) {
                    echo json_encode([
                        'success' => true,
                        'admin' => [
                            'name' => $row['name'],
                            'email' => $row['email'],
                            'role' => $row['role']
                        ]
                    ]);
                    exit;
                }
            }
        }
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Credenciais de administrador inválidas.']);
    exit;
}

// Rota: Listar Ferramentas
if ($action === 'tools' || ($action === '' && $_SERVER['REQUEST_METHOD'] === 'GET')) {
    $conn = getDbConnection();
    if (!$conn) {
        // Retorna ferramentas padrão se banco não configurado ainda
        echo json_encode(['source' => 'fallback', 'tools' => []]);
        exit;
    }

    $res = $conn->query("SELECT * FROM tools ORDER BY is_pinned DESC, display_order ASC, name ASC");
    $tools = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $tools[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'],
                'url' => $row['url'],
                'imageUrl' => $row['image_url'],
                'iconKey' => $row['icon_key'],
                'category' => $row['category'],
                'isPinned' => (bool)$row['is_pinned'],
                'order' => (int)$row['display_order'],
                'createdAt' => (int)$row['created_at'],
                'updatedAt' => (int)$row['updated_at'],
            ];
        }
    }
    echo json_encode(['source' => 'mysql', 'tools' => $tools]);
    exit;
}

// Rota: Salvar Ferramenta (Criar ou Atualizar)
if ($action === 'save_tool' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = getDbConnection();
    if (!$conn) {
        echo json_encode(['success' => false, 'error' => 'Banco de dados MySQL offline.']);
        exit;
    }

    $id = !empty($input['id']) ? $input['id'] : ('tool-' . time() . '-' . substr(md5(rand()), 0, 4));
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $url = trim($input['url'] ?? '');
    $imageUrl = !empty($input['imageUrl']) ? trim($input['imageUrl']) : null;
    $iconKey = !empty($input['iconKey']) ? trim($input['iconKey']) : 'globe';
    $category = !empty($input['category']) ? trim($input['category']) : 'Educação Inclusiva & PEI';
    $isPinned = !empty($input['isPinned']) ? 1 : 0;
    $order = isset($input['order']) && is_numeric($input['order']) ? (int)$input['order'] : 99;
    $now = (int)(microtime(true) * 1000);

    $stmt = $conn->prepare("INSERT INTO tools (id, name, description, url, image_url, icon_key, category, is_pinned, display_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), url=VALUES(url), image_url=VALUES(image_url), icon_key=VALUES(icon_key), category=VALUES(category), is_pinned=VALUES(is_pinned), display_order=VALUES(display_order), updated_at=VALUES(updated_at)");
    
    if ($stmt) {
        $stmt->bind_param('sssssssiiii', $id, $name, $description, $url, $imageUrl, $iconKey, $category, $isPinned, $order, $now, $now);
        $stmt->execute();
        echo json_encode(['success' => true, 'id' => $id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Rota: Excluir Ferramenta
if ($action === 'delete_tool' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = getDbConnection();
    if (!$conn) {
        echo json_encode(['success' => false, 'error' => 'Banco de dados MySQL offline.']);
        exit;
    }
    $id = $input['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM tools WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param('s', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

echo json_encode(['message' => 'API Escola Santa Teresinha ativa']);
