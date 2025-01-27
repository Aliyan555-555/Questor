import { ThemeModel } from "../model/theme.model.js";

export const GetAllThemes = async (req, res) => {
  try {
    const allThemes = await ThemeModel.find();
    res.status(200).json({ data: allThemes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
