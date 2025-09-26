<?php
header('Content-Type: application/json');

// Загрузка промокодов из JSON-файла
$promoCodes = json_decode(file_get_contents('promoCodes.json'), true);

function validatePromoCode($code, $promoCodes) {
    $needle = strtoupper(trim((string)$code));
    foreach ($promoCodes as $promo) {
        $pcode = strtoupper(trim((string)($promo['code'] ?? '')));
        $expires = isset($promo['expirationDate']) ? new DateTime($promo['expirationDate']) : null;
        if ($pcode === $needle && $expires && $expires >= new DateTime()) {
            return $promo;
        }
    }
    return false;
}

function applyDiscount($totalAmount, &$promoCode) {
    $discount = $totalAmount * ($promoCode['discountValue'] / 100);
    $newTotal = $totalAmount - $discount;
    return ['newTotal' => $newTotal, 'discount' => $promoCode['discountValue']];
}

// Обновление промокодов в JSON-файле
function updatePromoCodes($promoCodes) {
    file_put_contents('promoCodes.json', json_encode($promoCodes, JSON_PRETTY_PRINT));
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['promoCode']) || !isset($input['totalAmount'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$promoCodeInput = $input['promoCode'];
$totalAmount = floatval($input['totalAmount']);

$promoCode = validatePromoCode($promoCodeInput, $promoCodes);

if ($promoCode) {
    $result = applyDiscount($totalAmount, $promoCode);
    $newTotal = $result['newTotal'];
    $discount = $result['discount'];

    updatePromoCodes($promoCodes); // Обновление JSON-файла после применения промокода
    echo json_encode(['success' => true, 'newTotal' => $newTotal, 'discount' => $discount]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired promo code']);
}
?>
