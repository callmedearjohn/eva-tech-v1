<?php
header('Content-Type: application/json');

$DATA_FILE = __DIR__ . '/static/data/colors.json';
$ADMIN_KEY = getenv('EVATECH_ADMIN_KEY') ?: 'changeme-key';

function read_colors($file) {
  if (!file_exists($file)) { return [ 'matColors' => [], 'trimColors' => [] ]; }
  $json = file_get_contents($file);
  $data = json_decode($json, true);
  if (!$data) { $data = [ 'matColors' => [], 'trimColors' => [] ]; }
  return $data;
}

function write_colors($file, $data) {
  file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  echo json_encode(read_colors($DATA_FILE));
  exit;
}

// Mutations require key
$key = $_GET['key'] ?? $_POST['key'] ?? '';
if ($key !== $ADMIN_KEY) {
  http_response_code(401);
  echo json_encode([ 'error' => 'unauthorized' ]);
  exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$data = read_colors($DATA_FILE);

if ($method === 'POST') {
  // Upsert either mat or trim lists
  if (isset($body['matColors']) && is_array($body['matColors'])) { $data['matColors'] = array_values(array_unique($body['matColors'])); }
  if (isset($body['trimColors']) && is_array($body['trimColors'])) { $data['trimColors'] = array_values(array_unique($body['trimColors'])); }
  write_colors($DATA_FILE, $data);
  echo json_encode([ 'ok' => true, 'data' => $data ]);
  exit;
}

http_response_code(405);
echo json_encode([ 'error' => 'method not allowed' ]);
?>


