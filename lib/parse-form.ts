import formidable, {
  Fields,
  Files,
  errors as FormidableErrors,
} from "formidable";
import type { NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";
import { join } from "path";
import { format } from "date-fns";
import mime from "mime";

const supabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.SUPABASE_ANON_KEY}`
);

export const FormidableError = FormidableErrors.FormidableError;

export const parseForm = (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise(async (resolve, reject) => {
    const form = formidable({
      maxFiles: 3,
      maxFileSize: 2e7, // 20mb
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      },
      filter: (part) => {
        console.log(part.mimetype);
        return part.name === "media" && (part.mimetype?.includes("") || false);
      },
    });

    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${format(Date.now(), "dd-MM-Y")}`
    );
    const { mkdir, stat } = require("fs");
    try {
      await new Promise((resolve) => stat(uploadDir, resolve));
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await new Promise((resolve) =>
          mkdir(uploadDir, { recursive: true }, resolve)
        );
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    form.parse(req, async function (err, fields, files) {
      if (err) reject(err);
      else {
        console.log(files);
        const urls: any = {};
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        for (const [key, file] of Object.entries(files)) {
          console.log(file);
          const { data, error } = await supabase.storage
            .from("case-files")
            //@ts-ignore
            .upload(`${uniqueSuffix}/${file.name}`, file);
          if (error) {
            console.error(error);
            reject(error);
            return;
          }
          urls[key] = data.path;
        }
        resolve({ fields: { ...fields, ...urls }, files: urls });
      }
    });
  });
};
