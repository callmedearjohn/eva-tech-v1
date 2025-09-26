Promo codes (simple guide)

Who is this for: Anyone (no coding needed)

Where to edit: promoCodes.json in this folder.

How it works
- Each promo code is one entry in the list with these fields:
  - code: the text users type (not case sensitive)
  - discountValue: percent off (number)
  - expirationDate: last valid date (YYYY-MM-DD)

Steps to add or change a code
1) Open promoCodes.json
2) Add a new block at the top (or edit an existing one). Example for a 10% code:

{
  "code": "PROMO10",
  "discountValue": 10,
  "expirationDate": "2030-12-31"
}

3) Make sure items are separated by commas and there are no extra commas.
4) Save the file. Changes work immediately on the Cart page.

Notes
- Discount applies to products only (not to shipping or taxes).
- Expired codes will not work. Extend the date if needed.
- Codes ignore upper/lowercase (promo10, PROMO10 both work).


