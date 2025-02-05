import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

export const generateUniqueFileName = (originalname: string): string => {
    return `${uuidv4()}-${extname(originalname)}`;
}