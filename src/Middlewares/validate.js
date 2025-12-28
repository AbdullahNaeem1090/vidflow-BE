import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Zod validation error
      
      return res.status(400).json({
        success: false,
        message: err?.issues[0]?.message || "Validation error",
      });
    }

    // Any other unexpected error
    console.error("Unexpected validation error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
