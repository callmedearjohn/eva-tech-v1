<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Подключение файлов PHPMailer
require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

// Фиксированный адрес отправителя
$SENDER_EMAIL = 'info@eva-tech.ca';
$recipientEmail = 'info.evatech.ca@gmail.com';

// Настройки почтового сервера
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->SMTPDebug = 0;
$mail->Host = 'smtp.hostinger.com';
$mail->Port = 465;
$mail->SMTPAuth = true;
$mail->SMTPSecure = 'ssl';
$mail->Username = 'info@eva-tech.ca';
$mail->Password = 'Vlad0612!';
// Enforce UTF-8 to avoid mojibake in Order Summary tables and subjects
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'base64';


// --- Database helpers for order number persistence (mysqli) ---
function getDB(){
    static $db = null;
    if ($db instanceof mysqli) return $db;
    $servername = "localhost";
    $username = "u167309559_sheremet_vlad";
    $password = "Sheremet.vlad6";
    $dbname = "u167309559_orders";
    $db = new mysqli($servername, $username, $password, $dbname);
    if ($db->connect_error) {
        // Do not stop the script; let callers handle fallback via try/catch
        throw new Exception('Connection failed: ' . $db->connect_error);
    }
    ensureOrdersTable($db);
    return $db;
}

function ensureOrdersTable(mysqli $db){
    $sql = 'CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number BIGINT NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
    $db->query($sql);
}

// Atomically reserve and persist the next order number (starts at 101001)
function reserveOrderNumber(mysqli $db){
    $db->begin_transaction();
    try {
        $res = $db->query('SELECT order_number FROM orders ORDER BY order_number DESC LIMIT 1 FOR UPDATE');
        $baseline = 101001;
        $next = $baseline;
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $latest = (int)$row['order_number'];
            $next = max($baseline, $latest + 1);
        }
        if ($res) { $res->free(); }
        $stmt = $db->prepare('INSERT INTO orders (order_number) VALUES (?)');
        $stmt->bind_param('i', $next);
        $stmt->execute();
        $stmt->close();
        $db->commit();
        return (string)$next;
    } catch (Throwable $e) {
        $db->rollback();
        throw $e;
    }
}

// Функция для отправки заказа
function sendOrderEmail($data, $mail) {
    global $recipientEmail;

    try {
        $carMake = $data['carMake'];
$carModel = $data['carModel'];
$carYear = $data['carYear'];
$rugBackgroundColor = $data['rugBackgroundColor'];
$rugOutlineColor = $data['rugOutlineColor'];
$setType = $data['setType'];
$userPhone = $data['phone'];
$userName = $data['userName'];
$userEmail = $data['email'];
$totalPrice = $data['totalPrice'];
$shippingPrice = $data['shippingPrice'];
$subtotalPrice = $data['subtotalPrice'];
$userAddress = $data['address']; 
$userProvince = $data['province']; 
$promoCode = $data['promoCode']; 
$promoCodeValue = $data['promoCodeValue']; 
$userPostalCode = $data['postalCode']; 
$date = $data['date'];
// Server-side order number (ignore any frontend-provided value)
try { $orderNumber = reserveOrderNumber(getDB()); } catch (Exception $e) { $orderNumber = '101001'; }
$orderTextarea = $data['textareaValue'];
$discount = $data['discountValue'];

$mail->clearAddresses();
$mail->addAddress($recipientEmail);
$mail->setFrom('info@eva-tech.ca', 'EVA Carmats');

$mail->isHTML(true); 

$mail->Subject = "New order $orderNumber";
$mail->Body = "
<html>
<head>
<style>
 * {
    color: blue;
}

</style>
</head>
<body>
<ul> CarMat order:
<ul>Clients info:
<li>Clients Name: $userName;</li>
<li>Clients phone number: $userPhone;</li>
<li>Clients email: $userEmail;</li>
<li>Clients order number: $orderNumber ;</li>
<li>Clients notes: $orderTextarea ;</li>
</ul>
    <li>Product:</li>
    <ul>
        <li>Car make - $carMake;</li>
        <li>Car model - $carModel;</li>
        <li>Car year - $carYear;</li>
        <li>Mat color - $rugBackgroundColor;</li>
        <li>Trim color - $rugOutlineColor;</li>
    </ul>
    <li>Set Name: $setType (+Footrest for a driver mat as a gift!)</li>
    <ul>Adress information:
        <li>Street adress - $userAddress;</li>
        <li>Province - $userProvince;</li>
        <li>Postal code - $userPostalCode;</li>
        </ul>
    <ul>
    <li>Use promo code - $promoCode;</li>
    <li>Promo code name - $promoCodeValue;</li>
    <li>Shipping price - $shippingPrice $;</li>
    <li>Product price - $subtotalPrice $;</li>
    <li>Total price - $totalPrice $;</li>
    <li>Data and time: $date</li>
    </ul>
</ul>
</body>
</html>";

$mail->send();

$mail->clearAddresses();
$mail->addAddress($userEmail);
$mail->setFrom('info@eva-tech.ca ', 'EVA Carmats');
$mail->isHTML(true); 

$mail->Subject = 'Confirmation of Your EVA Carmats Order';

// Build branded HTML confirmation (same design language as partner confirmation)
$brand = '#11aa99';
$hUserName    = htmlspecialchars($userName);
$hMake        = htmlspecialchars($carMake);
$hModel       = htmlspecialchars($carModel);
$hYear        = htmlspecialchars($carYear);
$hMat         = htmlspecialchars($rugBackgroundColor);
$hTrim        = htmlspecialchars($rugOutlineColor);
$hSet         = htmlspecialchars($setType);
$hAddress     = htmlspecialchars($userAddress);
$hProvince    = htmlspecialchars($userProvince);
$hPostal      = htmlspecialchars($userPostalCode);
$hPromo       = htmlspecialchars($promoCode);
$hSubtotal    = htmlspecialchars($subtotalPrice);
$hShipping    = htmlspecialchars($shippingPrice);
$hTotal       = htmlspecialchars($totalPrice);
$hDiscount    = htmlspecialchars($discount);
$hOrderNumber = htmlspecialchars($orderNumber);
$hNotes       = htmlspecialchars($orderTextarea);

$confirmBodyHtml =
    "<html><body style='background:#f6f9fc;margin:0;padding:24px;'>" .
    "<div style='max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e9eef3;border-radius:10px;overflow:hidden;font-family:Arial,sans-serif;'>" .
        "<div style='padding:16px 20px;border-bottom:1px solid #eef3f7;background:#ffffff;'>" .
            "<div style='font-size:18px;font-weight:700;color:" . $brand . ";letter-spacing:0.2px;'>EVATECH</div>" .
            "<div style='margin-top:2px;color:#667085;font-size:12px;'>Order confirmation</div>" .
        "</div>" .
        "<div style='padding:22px 24px;color:#111;font-size:14px;line-height:1.6;'>" .
            "<p style='margin:0 0 12px;'>Hi " . $hUserName . ",</p>" .
            "<p style='margin:0 0 12px;color:#2c2c2c;'>Thanks for your order. We've received it and will contact you shortly to confirm details and shipping.</p>".
            "<div style='margin:16px 0 8px;padding:14px 16px;background:#fafbfc;border:1px solid #edf2f7;border-radius:8px;'>" .
                "<div style='font-weight:600;color:#111;font-size:14px;margin:0 0 8px;'>Order # " . $hOrderNumber . "</div>" .
                "<ul style='margin:0;padding:0;list-style:none;color:#444;font-size:13px;line-height:1.6;'>" .
                    "<li><strong>Car:</strong> " . $hMake . " " . $hModel . " " . $hYear . "</li>" .
                    "<li><strong>Set:</strong> " . $hSet . "</li>" .
                    "<li><strong>Colors:</strong> " . $hMat . " / " . $hTrim . "</li>" .
                    "<li><strong>Address:</strong> " . $hAddress . ", " . $hProvince . ", " . $hPostal . "</li>" .
                    (strlen(trim($promoCode)) ? "<li><strong>Promo code:</strong> " . $hPromo . "</li>" : "") .
                    "<li><strong>Product price:</strong> " . $hSubtotal . " $</li>" .
                    "<li><strong>Shipping:</strong> " . $hShipping . " $</li>" .
                    (strlen(trim($discount)) ? "<li><strong>Discount:</strong> " . $hDiscount . " %</li>" : "") .
                    "<li><strong>Total:</strong> <span style='color:" . $brand . ";font-weight:600;'>" . $hTotal . " $</span></li>" .
                "</ul>" .
            "</div>" .
            (strlen(trim($orderTextarea)) ? "<p style='margin:12px 0 0;color:#444;font-size:13px;'><strong>Your notes:</strong> " . nl2br($hNotes) . "</p>" : "") .
            "<p style='margin:16px 0 0;color:#111;font-size:14px;font-weight:600;'>Payment via Interac e‑Transfer</p>" .
            "<p style='margin:4px 0 0;color:#444;font-size:13px;line-height:1.6;'>Please send the total amount to <a style='color:" . $brand . ";text-decoration:none;' href='mailto:info@eva-tech.ca'>info@eva-tech.ca</a>. No message required.</p>" .
            "<p style='margin:4px 0 0;color:#444;font-size:13px;line-height:1.6;'><strong>Secret Question:</strong> My order number (" . $hOrderNumber . ")<br><strong>Secret Answer:</strong> Evatech</p>" .
            "<p style='margin:12px 0 0;'>If you need help, email us at <a style='color:" . $brand . ";text-decoration:none;' href='mailto:info.evatech.ca@gmail.com'>info.evatech.ca@gmail.com</a> or call <a style='color:" . $brand . ";text-decoration:none;' href='tel:+16132141621'>+1 613-214-1621</a>.</p>" .
            "<p style='margin:16px 0 0;color:#111;'>Best regards,<br>EVATECH</p>" .
        "</div>" .
        "<div style='padding:12px 20px;border-top:1px solid #eef3f7;background:#ffffff;color:#8a94a6;font-size:12px;text-align:center;'>Kingston, ON · <a style='color:" . $brand . ";text-decoration:none;' href='https://www.instagram.com/evatech.ca/'>Instagram</a> · <a style='color:" . $brand . ";text-decoration:none;' href='https://www.facebook.com/people/VI-CarMats/61556124253098/?mibextid=sCpJLy'>Facebook</a></div>" .
    "</div>" .
    "</body></html>";

$mail->Body = $confirmBodyHtml;
$mail->AltBody =
    "Order confirmation (EVATECH)\n" .
    "Order #: " . $orderNumber . "\n" .
    "Car: " . $carMake . " " . $carModel . " " . $carYear . "\n" .
    "Set: " . $setType . "\n" .
    "Colors: " . $rugBackgroundColor . "/" . $rugOutlineColor . "\n" .
    "Address: " . $userAddress . ", " . $userProvince . ", " . $userPostalCode . "\n" .
    (strlen(trim($promoCode)) ? ("Promo code: " . $promoCode . "\n") : "") .
    "Product price: " . $subtotalPrice . "$\n" .
    "Shipping: " . $shippingPrice . "$\n" .
    (strlen(trim($discount)) ? ("Discount: " . $discount . "%\n") : "") .
    "Total: " . $totalPrice . "$\n" .
    (strlen(trim($orderTextarea)) ? ("Notes: " . $orderTextarea . "\n") : "") .
    "Payment: E-transfer to info@eva-tech.ca (Question: My order number (" . $orderNumber . ") / Answer: Evatech)\n" .
    "+1 613-214-1621";

$mail->send();



        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}


// Функция для отправки вопросов
function sendQuestionsEmail($data, $mail) {
    global $recipientEmail;

    try {
        $userName = $data['userName'];
        $userEmail = $data['userEmail'];
        $userMessage = $data['userMessage'];
        $date = $data['date'] ?? date('Y-m-d H:i:s');

        $mail->clearAddresses();

        $mail->addAddress($recipientEmail);
        $mail->setFrom('info@eva-tech.ca', 'EVA Carmats');

        $mail->Subject = 'Questions';
        $mail->Body = "Clients Name: $userName\nClients Email: $userEmail\nClients Question: $userMessage\nDate and time: $date";

        $mail->send();
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

// One-click purchase: phone only + cart summary
function sendOneClickEmail($data, $mail) {
    global $recipientEmail;

    try {
        $phone = $data['phone'] ?? '';
        $items = $data['items'] ?? [];
        $country = $data['country'] ?? '';
        $shipping = $data['shipping'] ?? 0;
        $subtotal = $data['subtotal'] ?? 0;
        $bag = $data['bag'] ?? 0;
        $total = $data['total'] ?? 0;

        $mail->clearAddresses();
        $mail->addAddress($recipientEmail);
        $mail->setFrom('info@eva-tech.ca', 'EVA Carmats');
        $mail->isHTML(true);

        $rows = '';
        // Helper to normalize color values like #000000 → black when possible
        $colorName = function($c){
            $c = trim(strtolower((string)$c));
            if ($c === '') return '—';
            if (preg_match('/^#?[0-9a-f]{6}$/i', $c)) {
                $hex = ltrim($c, '#');
                $map = [
                    '000000'=>'black','ffffff'=>'white','d9d9d9'=>'gray','e5e5e5'=>'light-grey','777777'=>'darkgray',
                    '2b61c8'=>'blue','124b9a'=>'darkblue','8a5b3c'=>'brown','ff1a13'=>'red','ffa000'=>'orange','ffee00'=>'yellow',
                    'dcc48e'=>'beige','7bc96f'=>'salad','6f1d8a'=>'violet','ff5e9c'=>'pink','d4af37'=>'gold'
                ];
                return $map[strtolower($hex)] ?? ('#' . $hex);
            }
            return $c;
        };
        foreach ($items as $i) {
            $product = $i['product'] ?? 'mats';
            $set = $i['set'] ?? '';
            $mat = $colorName($i['matColor'] ?? '');
            $trim = $colorName($i['trimColor'] ?? '');
            $price = $i['subtotal'] ?? 0;
            $qty = $i['qty'] ?? 1;
            if ($product === 'carsbag' || $product === 'home') {
                $sizeMap = ($product === 'carsbag')
                    ? ['front'=>'M','full'=>'L']
                    : ['front'=>'S','full'=>'M','complete'=>'L','xl'=>'XL'];
                $size = $sizeMap[$set] ?? strtoupper($set);
                $title = ($product === 'carsbag') ? 'Cars Bag' : 'Home Mat';
                $rows .= "<li><b>{$title}</b> — Size: {$size} | Colors: {$mat}/{$trim} | price: {$price}$ × {$qty}</li>";
            } else {
                $make = $i['make'] ?? '';
                $model = $i['model'] ?? '';
                $year = $i['year'] ?? '';
                $pattern = $i['pattern'] ?? '';
                $third = (!empty($i['thirdRow'])) ? 'Yes' : 'No';
                $heel = (!empty($i['heelPad'])) ? 'Yes' : 'No';
                $hybrid = (!empty($i['hybrid'])) ? 'Yes' : 'No';
                $setNames = [
                    'front' => 'Front only (2 mats)',
                    'full' => 'Front row & Rear row',
                    'complete' => 'Front row & Rear row & Cargo mat',
                    'premium_plus' => 'Premium + (Front + 2nd + 3rd + Trunk)'
                ];
                $setLabel = $setNames[$set] ?? $set;
                $rows .= "<li><b>{$make} {$model} {$year}</b> — {$setLabel} | Pattern: {$pattern} | Colors: {$mat}/{$trim} | Heel pad: {$heel} | Hybrid: {$hybrid} | price: {$price}$ × {$qty}</li>";
            }
        }

        $mail->Subject = 'One-Click Purchase Request';
        $mail->Body = "<html><body>
            <h3>One-click order request</h3>
            <p><b>Customer phone:</b> {$phone}</p>
            <ul>{$rows}</ul>
            <p><b>Subtotal:</b> {$subtotal}$</p>
            <p><b>Bag:</b> {$bag}$</p>
            <p><b>Shipping (to {$country}):</b> {$shipping}$</p>
            <p><b>Total:</b> {$total}$</p>
        </body></html>";
        $mail->send();
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

// PayPal order email
function sendPaypalEmail($data, $mail) {
    global $recipientEmail;
    try {
        $phone = $data['phone'] ?? '';
        $items = $data['items'] ?? [];
        $shipping = $data['shipping'] ?? 0;
        $subtotal = $data['subtotal'] ?? 0;
        $tax = $data['tax'] ?? 0;
        $total = $data['total'] ?? 0;
        $addons = $data['addons'] ?? [];
        $addonsTotal = $data['addonsTotal'] ?? 0;
        $paypalId = $data['paypalOrderId'] ?? '';
        $payerEmail = $data['payerEmail'] ?? '';
        $payerName = $data['payerName'] ?? '';
        $shipTo = $data['shipTo'] ?? [];

        // Server-side sequential order number saved to DB (ignore frontend)
        try { $orderNumber = reserveOrderNumber(getDB()); } catch (Exception $e) { $orderNumber = '101001'; }

        $mail->clearAddresses();
        $mail->addAddress($recipientEmail);
        $mail->setFrom('info@eva-tech.ca', 'EVA Carmats');
        $mail->isHTML(true);

        // Helpers
        $colorName = function($c){
            $c = trim(strtolower((string)$c));
            if ($c === '') return '—';
            if (preg_match('/^#?[0-9a-f]{6}$/i', $c)) {
                $hex = ltrim($c, '#');
                $map = [
                    '000000'=>'black','ffffff'=>'white','d9d9d9'=>'gray','e5e5e5'=>'light-grey','777777'=>'darkgray',
                    '2b61c8'=>'blue','124b9a'=>'darkblue','8a5b3c'=>'brown','ff1a13'=>'red','ffa000'=>'orange','ffee00'=>'yellow',
                    'dcc48e'=>'beige','7bc96f'=>'salad','6f1d8a'=>'violet','ff5e9c'=>'pink','d4af37'=>'gold'
                ];
                return $map[strtolower($hex)] ?? ('#' . $hex);
            }
            return $c;
        };

        $setNames = [
            'front' => 'Front only (2 mats)',
            'full' => 'Front row & Rear row',
            'complete' => 'Front row & Rear row & Cargo mat',
            'premium_plus' => 'Premium + (Front + 2nd + 3rd + Trunk)'
        ];

        $itemRows = '';
        foreach ($items as $i) {
            $product = $i['product'] ?? 'mats';
            $set = $i['set'] ?? '';
            $mat = $colorName($i['matColor'] ?? '');
            $trim = $colorName($i['trimColor'] ?? '');
            $price = $i['subtotal'] ?? 0;
            $qty = $i['qty'] ?? 1;

            if ($product === 'carsbag' || $product === 'home') {
                $sizeMap = ($product === 'carsbag')
                    ? ['front'=>'M','full'=>'L']
                    : ['front'=>'S','full'=>'M','complete'=>'L','xl'=>'XL'];
                $size = $sizeMap[$set] ?? strtoupper($set);
                $title = ($product === 'carsbag') ? 'Cars Bag' : 'Home Mat';
                $details = "Size: {$size}; Colors: {$mat}/{$trim}";
                $itemRows .= "<tr><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$title}</td><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$details}</td><td style='text-align:center;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$qty}</td><td style='text-align:right;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$price}$</td></tr>";
            } else {
                $make = $i['make'] ?? '';
                $model = $i['model'] ?? '';
                $year = $i['year'] ?? '';
                $pattern = $i['pattern'] ?? '';
                $third = (!empty($i['thirdRow'])) ? 'Yes' : 'No';
                $heel = (!empty($i['heelPad'])) ? 'Yes' : 'No';
                $hybrid = (!empty($i['hybrid'])) ? 'Yes' : 'No';
                $setLabel = $setNames[$set] ?? $set;
                $title = trim("$make $model $year — $setLabel");
                $details = "Pattern: {$pattern}; Colors: {$mat}/{$trim}; Heel pad: {$heel}; Hybrid: {$hybrid}";
                $itemRows .= "<tr><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$title}</td><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$details}</td><td style='text-align:center;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$qty}</td><td style='text-align:right;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$price}$</td></tr>";
            }
        }

        if (!empty($addons)) {
            foreach ($addons as $a) {
                $aname = $a['name'] ?? 'Add‑on';
                $aprice = $a['price'] ?? 0;
                $itemRows .= "<tr><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$aname}</td><td style='padding:8px 6px;border-bottom:1px solid #e5e7eb;'>—</td><td style='text-align:center;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>1</td><td style='text-align:right;padding:8px 6px;border-bottom:1px solid #e5e7eb;'>{$aprice}$</td></tr>";
            }
        }

        $address = '';
        if (!empty($shipTo)) {
            $name = $shipTo['name'] ?? '';
            $line1 = $shipTo['line1'] ?? '';
            $line2 = $shipTo['line2'] ?? '';
            $city = $shipTo['city'] ?? '';
            $state = $shipTo['state'] ?? '';
            $postal = $shipTo['postal'] ?? '';
            $country = $shipTo['country'] ?? '';
            $address = "$name, $line1 $line2, $city, $state, $postal, $country";
        }

        $discountPercent = $data['discountPercent'] ?? 0;
        $discountAmount  = $data['discountAmount'] ?? 0;
        $promoCode       = $data['promoCode'] ?? '';

        $table = "<table style='width:100%;border-collapse:collapse;font-size:13px;line-height:1.4;'>
            <thead>
                <tr>
                    <th style='text-align:left;border-bottom:1px solid #e5e7eb;padding:6px 6px;'>Item</th>
                    <th style='text-align:left;border-bottom:1px solid #e5e7eb;padding:6px 6px;'>Details</th>
                    <th style='text-align:center;border-bottom:1px solid #e5e7eb;padding:6px 6px;'>Qty</th>
                    <th style='text-align:right;border-bottom:1px solid #e5e7eb;padding:6px 6px;'>Price</th>
                </tr>
            </thead>
            <tbody style='font-size:12px;line-height:1.6;'>{$itemRows}</tbody>
        </table>";

        $mail->Subject = 'PayPal Order #' . $orderNumber;
        $mail->Body = "<html><body>
            <h3 style='margin:0 0 6px;font-size:18px;'>PayPal order captured</h3>
            <p style='margin:0 0 4px;font-size:13px;'><b>Order #:</b> {$orderNumber}</p>
            <p style='margin:0 0 4px;font-size:13px;'><b>PayPal Order ID:</b> {$paypalId}</p>
            <p style='margin:0 0 4px;font-size:13px;'><b>Payer:</b> {$payerName} ({$payerEmail})</p>
            <p style='margin:0 0 4px;font-size:13px;'><b>Phone:</b> {$phone}</p>
            <p style='margin:0 0 10px;font-size:13px;'><b>Ship To:</b> {$address}</p>
            {$table}
            <p style='margin:10px 0 0;font-size:13px;'><b>Subtotal:</b> {$subtotal}$</p>
            <p style='margin:2px 0 0;font-size:13px;'><b>Add-ons:</b> {$addonsTotal}$</p>
            " . (!empty($promoCode) || $discountAmount>0 ? "<p style='margin:2px 0 0;font-size:13px;'><b>Discount:</b> {$discountAmount}$ ({$discountPercent}%)</p>" : "") . "
            " . (!empty($promoCode) ? "<p style='margin:2px 0 0;font-size:13px;'><b>Promo code:</b> {$promoCode}</p>" : "") . "
            <p style='margin:2px 0 0;font-size:13px;'><b>Tax:</b> {$tax}$</p>
            <p style='margin:2px 0 0;font-size:13px;'><b>Shipping:</b> {$shipping}$</p>
            <p style='margin:4px 0 0;font-size:13px;'><b>Total:</b> {$total}$</p>
        </body></html>";
        $mail->send();

        // Send confirmation email to payer
        if (!empty($payerEmail)) {
            try {
                $mail->clearAddresses();
                $mail->setFrom('info@eva-tech.ca', 'EVATECH Team');
                $mail->addAddress($payerEmail);
                $mail->isHTML(true);
                $mail->Subject = 'Thank you for your order - EVATECH #' . $orderNumber;

                $brand = '#11aa99';
                $confirmBody = "<html><body style='background:#f6f9fc;margin:0;padding:24px;'>
                    <div style='max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e9eef3;border-radius:10px;overflow:hidden;font-family:Arial,sans-serif;'>
                      <div style='padding:14px 18px;border-bottom:1px solid #eef3f7;background:#ffffff;'>
                        <div style='font-size:16px;font-weight:700;color:#111;'>EVATECH</div>
                        <div style='margin-top:2px;color:#667085;font-size:12px;'>Order confirmation</div>
                      </div>
                      <div style='padding:18px 20px;color:#111;font-size:14px;line-height:1.5;'>
                        <p style='margin:0 0 12px;'>Hi " . htmlspecialchars($payerName) . ",</p>
                        <p style='margin:0 0 12px;'>We appreciate your recent order for car mats and are excited to share that it has been successfully processed. Your choice in enhancing your vehicle's interior with our new generation car mats is valued.</p>
                        <p style='margin:0 0 4px;'><b>Order #:</b> " . htmlspecialchars($orderNumber) . "</p>
                        <p style='margin:0 0 4px;'><b>PayPal Order ID:</b> " . htmlspecialchars($paypalId) . "</p>
                        <p style='margin:0 0 4px;'><b>Phone provided:</b> " . htmlspecialchars($phone) . "</p>
                        <p style='margin:0 0 10px;'><b>Shipping to:</b> " . htmlspecialchars($address) . "</p>
                        <div style='margin:10px 0;padding:10px 12px;background:#fafbfc;border:1px solid #edf2f7;border-radius:8px;'>
                          <div style='font-weight:600;margin:0 0 8px;'>Order summary</div>
                          {$table}
                          <p style='margin:8px 0 0;font-size:13px;'>Subtotal: <b>{$subtotal}$</b></p>
                          <p style='margin:2px 0 0;font-size:13px;'>Tax: <b>{$tax}$</b></p>
                          <p style='margin:2px 0 0;font-size:13px;'>Shipping: <b>{$shipping}$</b></p>
                          <p style='margin:6px 0 0;font-size:13px;'>Total: <b>{$total}$</b></p>
                        </div>
                        <p style='margin:12px 0 0;'>Your satisfaction is our priority, and we are committed to ensuring a seamless experience. Should you need immediate assistance, feel free to contact our customer service team at <a style='color:" . $brand . ";text-decoration:none;' href='tel:+16132141621'>+1 613-214-1621</a>.<br>Thank you for choosing us for your automotive accessory needs. We look forward to serving you.<br><br>Best regards,<br>Evatech</p>
                      </div>
                    </div>
                  </body></html>";

                $mail->Body = $confirmBody;
                $mail->AltBody = "Thank you for your order!\nOrder #: {$orderNumber}\nPayPal Order ID: {$paypalId}\nPhone: {$phone}\nShip to: {$address}\nTotal: {$total}$\nBest regards, EVATECH";
                $mail->send();
            } catch (Exception $e) {
                // Ignore payer email failures to avoid breaking the main flow
            }
        }
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

// Partner forms
function sendPartnerEmail($data, $mail) {
	global $recipientEmail;
	try {
		$type = $data['type'] ?? 'unknown';

		// Normalize known fields
		$submitterEmail = $data['email'] ?? '';
		$submitterPhone = $data['phone'] ?? '';
		$now = date('Y-m-d H:i:s');

		// Build a structured body per type
		if ($type === 'collaboration') {
			$name = $data['name'] ?? '';
			$message = $data['message'] ?? '';
			$subject = 'Partner request: Collaboration (license/patent)';
			$body = "<h3>Collaboration (license/patent)</h3>"
				. "<ul>"
				. "<li><strong>Name:</strong> " . htmlspecialchars($name) . "</li>"
				. "<li><strong>Email:</strong> " . htmlspecialchars($submitterEmail) . "</li>"
				. "<li><strong>Phone:</strong> " . htmlspecialchars($submitterPhone) . "</li>"
				. "<li><strong>Message:</strong> " . nl2br(htmlspecialchars($message)) . "</li>"
				. "<li><strong>Date:</strong> {$now}</li>"
				. "</ul>";
		} elseif ($type === 'wholesale') {
			$company = $data['company'] ?? '';
			$message = $data['message'] ?? '';
			$subject = 'Partner request: Wholesale (bulk orders)';
			$body = "<h3>Wholesale (bulk orders)</h3>"
				. "<ul>"
				. "<li><strong>Company:</strong> " . htmlspecialchars($company) . "</li>"
				. "<li><strong>Email:</strong> " . htmlspecialchars($submitterEmail) . "</li>"
				. "<li><strong>Phone:</strong> " . htmlspecialchars($submitterPhone) . "</li>"
				. "<li><strong>Request:</strong> " . nl2br(htmlspecialchars($message)) . "</li>"
				. "<li><strong>Date:</strong> {$now}</li>"
				. "</ul>";
		} else {
			$subject = 'Partner request: ' . $type;
			$body = '<pre>' . htmlspecialchars(print_r($data, true)) . '</pre>';
		}

		$mail->clearAddresses();
		$mail->clearReplyTos();
		$mail->addAddress($recipientEmail);
		$mail->setFrom('info@eva-tech.ca', 'EVA Carmats');
		if (!empty($submitterEmail)) {
			$mail->addReplyTo($submitterEmail);
		}
		$mail->isHTML(true);
		$mail->Subject = $subject;
		$mail->Body = $body;
		$mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $body));

		$mail->send();

		// Send confirmation email to the submitter (pretty HTML)
		if (!empty($submitterEmail)) {
			$displayName = trim($data['name'] ?? '');
			$company     = trim($data['company'] ?? '');
			$messageTxt  = trim($data['message'] ?? '');
			$greeting    = $displayName !== '' ? 'Hi ' . htmlspecialchars($displayName) . ',' : 'Hi,';
			$hEmail      = htmlspecialchars($submitterEmail);
			$hPhone      = htmlspecialchars($submitterPhone);
			$hDate       = htmlspecialchars($now);

			$summaryTitle = 'Your request';
			$summaryList  = '';
			if ($type === 'collaboration') {
				$summaryList =
					'<li><strong>Name:</strong> ' . htmlspecialchars($displayName) . '</li>' .
					'<li><strong>Email:</strong> ' . $hEmail . '</li>' .
					'<li><strong>Phone:</strong> ' . $hPhone . '</li>' .
					'<li><strong>Message:</strong> ' . nl2br(htmlspecialchars($messageTxt)) . '</li>' .
					'<li><strong>Date:</strong> ' . $hDate . '</li>';
			} elseif ($type === 'wholesale') {
				$summaryList =
					'<li><strong>Company:</strong> ' . htmlspecialchars($company) . '</li>' .
					'<li><strong>Email:</strong> ' . $hEmail . '</li>' .
					'<li><strong>Phone:</strong> ' . $hPhone . '</li>' .
					'<li><strong>Request:</strong> ' . nl2br(htmlspecialchars($messageTxt)) . '</li>' .
					'<li><strong>Date:</strong> ' . $hDate . '</li>';
			} else {
				$summaryList =
					'<li><strong>Email:</strong> ' . $hEmail . '</li>' .
					'<li><strong>Phone:</strong> ' . $hPhone . '</li>' .
					'<li><strong>Date:</strong> ' . $hDate . '</li>';
			}

			$brand = '#11aa99';
			$confirmBodyHtml =
				"<html><body style='background:#f6f9fc;margin:0;padding:24px;'>" .
				"<div style='max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e9eef3;border-radius:10px;overflow:hidden;'>" .
					"<div style='padding:16px 20px;border-bottom:1px solid #eef3f7;background:#ffffff;'>" .
						"<div style='font-size:18px;font-weight:700;color:" . $brand . ";letter-spacing:0.2px;'>EVATECH</div>" .
						"<div style='margin-top:2px;color:#667085;font-size:12px;'>Partner request received</div>" .
					"</div>" .
					"<div style='padding:22px 24px;'>" .
						"<p style='margin:0 0 12px;color:#111;font-size:15px;'>$greeting</p>" .
						"<p style='margin:0 0 12px;color:#2c2c2c;font-size:14px;line-height:1.6;'>Thanks for contacting <span style='color:$brand;font-weight:600;'>EVATECH</span>. We&rsquo;ve received your message and will get back to you within 1 business day.</p>" .
						"<div style='margin:16px 0 8px;padding:14px 16px;background:#fafbfc;border:1px solid #edf2f7;border-radius:8px;'>" .
							"<div style='font-weight:600;color:#111;font-size:14px;margin:0 0 8px;'>$summaryTitle</div>" .
							"<ul style='margin:0;padding:0;list-style:none;color:#444;font-size:13px;line-height:1.6;'>$summaryList</ul>" .
						"</div>" .
						"<p style='margin:16px 0 0;color:#444;font-size:13px;line-height:1.6;'>If you need help sooner, email us at <a style='color:$brand;text-decoration:none;' href='mailto:info.evatech.ca@gmail.com'>info.evatech.ca@gmail.com</a> or call <a style='color:$brand;text-decoration:none;' href='tel:+16132141621'>+1 613-214-1621</a>.</p>" .
						"<p style='margin:16px 0 0;color:#111;font-size:14px;'>EVATECH Team</p>" .
					"</div>" .
					"<div style='padding:12px 20px;border-top:1px solid #eef3f7;background:#ffffff;color:#8a94a6;font-size:12px;text-align:center;'>Kingston, ON · <a style='color:$brand;text-decoration:none;' href='https://www.instagram.com/evatech.ca/'>Instagram</a> · <a style='color:$brand;text-decoration:none;' href='https://www.facebook.com/people/VI-CarMats/61556124253098/?mibextid=sCpJLy'>Facebook</a></div>" .
				"</div>" .
				"</body></html>";

			$confirmAlt =
				"Thanks for contacting EVATECH. We&rsquo;ve received your message and will get back to you within 1 business day.\n\n" .
				"$summaryTitle:\n" .
				strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", preg_replace('/<li>\s*<strong>/', '- ', $summaryList))) .
				"\n\n— EVATECH Team\nKingston, ON\nInstagram: https://www.instagram.com/evatech.ca/\nFacebook: https://www.facebook.com/people/VI-CarMats/61556124253098/?mibextid=sCpJLy";

			$mail->clearAddresses();
			$mail->clearReplyTos();
			$mail->addAddress($submitterEmail);
			$mail->setFrom('info@eva-tech.ca', 'EVATECH Team');
			$mail->isHTML(true);
			$mail->Subject = 'We\'ve received your request - EVATECH';
			$mail->Body = $confirmBodyHtml;
			$mail->AltBody = $confirmAlt;
			$mail->send();
		}

		return true;
	} catch (Exception $e) {
		return $e->getMessage();
	}
}

// Обработчик POST запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $rawBody = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $data = null;
    if (stripos($contentType, 'application/json') !== false) {
        $parsed = json_decode($rawBody, true);
        if (is_array($parsed)) {
            $data = $parsed;
        }
    }
    if (!is_array($data) || empty($data)) {
        // Fallback to traditional form POST
        $data = $_POST;
    }
    $formName = $data['formName'] ?? '';

    $mail->isHTML(false);
    $successMessage = "Your request was sent successfully!";

    switch ($formName) {
        case 'modalBuy':
            $result = sendOrderEmail($data, $mail);
            break;
        case 'feedback':
            $result = sendQuestionsEmail($data, $mail);
            $successMessage = "Your message was sent successfully!";
            break;
        case 'oneClick':
            $result = sendOneClickEmail($data, $mail);
            break;
        case 'paypal':
            $result = sendPaypalEmail($data, $mail);
            break;
        case 'partner':
            $result = sendPartnerEmail($data, $mail);
            break;
        default:
            $result = 'Invalid endpoint';
            break;
    }

    if ($result === true) {
        http_response_code(200);
    } else {
        http_response_code(500);
    }
}
?>
