// CREATE
export const createProduct = async (req, res, next) => {
  try {
    const imagePath = req.file ? req.file.path : null;
    const product = await createProductService(req.body, imagePath, req.user?.id);
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateProduct = async (req, res, next) => {
  try {
    const imagePath = req.file ? req.file.path : null;
    const product = await updateProductService(req.params.id, req.body, imagePath, req.user?.id);
    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};