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
$mail->SMTPDebug = 2;
$mail->Host = 'smtp.hostinger.com';
$mail->Port = 465;
$mail->SMTPAuth = true;
$mail->SMTPSecure = 'ssl';
$mail->Username = 'info@eva-tech.ca';
$mail->Password = 'Vlad0612!';


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
$orderNumber = $data['orderNumber'];
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
$mail->Body = "
<html>
<head>
<style>
* {
    color: black;
}
.bold {
    font-weight: bold;
}
.blue {
    color: blue;
}
</style>
</head>
<body>
<p>Dear $userName,</p>
<p>We appreciate your recent order for car mats and are excited to share that it has been successfully processed. Your choice in enhancing your vehicle's interior with our new generation car mats is valued.</p>
<p>Here are the details of your order:</p>
<ul>
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
    <li>Shipping price - $shippingPrice $;</li>
    <li>Product price - $subtotalPrice $;</li>
    <li>Dicount - $discount %;</li>
    <li class='blue'>Total price - $totalPrice $;</li>
    </ul>
</ul>
<p class='bold'>Please send your payment total amount to <span class='blue'>info@eva-tech.ca</span> by E-transfer. No need to write anything in the message.</p>
<p class='bold'>Secret Question: My order number ($orderNumber)<br>Secret Answer: Evatech</p>
<p>Our team will be reaching out to you shortly to confirm the order and shipping information any questions you may have. Your satisfaction is our priority, and we are committed to ensuring a seamless experience.</p>
<p>Should you need immediate assistance, feel free to contact our customer service team at +1 613-214-1621.</p>
<p>Thank you for choosing us for your automotive accessory needs. We look forward to serving you.</p>
<p>Best regards,<br>
Evatech<br>
+1 613-214-1621</p>
</body>
</html>
";

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
        $date = $data['date'];

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

// Обработчик POST запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
    $formName = $data['formName'];

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
