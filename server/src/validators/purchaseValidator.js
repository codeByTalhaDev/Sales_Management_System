// PURCHASE VALIDATORS

export const validateCreatePurchase = (req, res, next) => {
  const { supplierId, purchaseDate, items, paidAmount } = req.body;

  if (!supplierId || !purchaseDate || !items || items.length === 0) {
    return res.status(400).json({
      message: "Supplier, purchase date and items are required",
    });
  }

  // VALIDATE EACH ITEM HAS REQUIRED FIELDS
  for (const item of items) {
    if (!item.productId || !item.quantity || !item.purchasePrice) {
      return res.status(400).json({
        message: "Each item must have productId, quantity and purchasePrice",
      });
    }
  }

  next();
};