import mongoose  from "mongoose";

const ThemeSchema = mongoose.Schema({
    image:{
        type:{
            type:String,
            default:"/images/theme/1.webp"
        }
    }
});

export const ThemeModel = mongoose.model("Theme", ThemeSchema);