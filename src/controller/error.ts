import path from "path";
import rootDir from "../util/path";

export const pageNotFound=(req: any, res: { sendFile: (arg0: string) => void; }, next: any)=>{
    res.sendFile(path.join(rootDir,"view","pageNotFound.html"))
}