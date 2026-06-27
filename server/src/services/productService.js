// HELPER — build product fields (shared by create & update)
const buildProductFields = (data, existingBarcode = null, imagePath = null, existingImage = null) => {
  const {
    productName,
    barcode,
    autoGenerateBarcode,
    categoryId,
    uomId,
    purchasePrice,
    salePrice,
    manageInventory,
    quantity,
    reorderQuantity,
    hasExpiryDate,
    expiryDate,
    description,
  } = data;

  const isAutoBarcode   = parseBool(autoGenerateBarcode);
  const isManageInv     = parseBool(manageInventory);
  const isHasExpiry     = parseBool(hasExpiryDate);

  const finalBarcode = isAutoBarcode
    ? existingBarcode || generateBarcode()
    : barcode || null;

  return {
    productName,
    barcode: finalBarcode,
    autoGenerateBarcode: isAutoBarcode,
    categoryId,
    uomId,
    purchasePrice:   purchasePrice   || 0,
    salePrice:       salePrice       || 0,
    manageInventory: isManageInv,
    quantity:        isManageInv ? quantity      || 0 : 0,
    reorderQuantity: isManageInv ? reorderQuantity || 0 : 0,
    hasExpiryDate:   isHasExpiry,
    expiryDate:      isHasExpiry ? expiryDate || null : null,
    description,
    image: imagePath || existingImage,
  };
};

// CREATE
export const createProductService = async (data, imagePath, userId) => {
  const fields = buildProductFields(data, null, imagePath);

  const product = await Product.create({
    ...fields,
    createdBy: userId,
  });

  return product;
};

// UPDATE
export const updateProductService = async (id, data, imagePath, userId) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const fields = buildProductFields(data, product.barcode, imagePath, product.image);

  await product.update({
    ...fields,
    updatedBy: userId,
  });

  return product;
};