import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormFields {
  title: string;
  description: string;
  category: string;
}

interface FormFiles {
  pdfFile: File;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email !== "v.vamsi3666@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise<{
      fields: FormFields;
      files: FormFiles;
    }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else
          resolve({
            fields: fields as unknown as FormFields,
            files: files as unknown as FormFiles,
          });
      });
    });

    const { title, description, category } = fields;
    const pdf = files.pdfFile;

    if (!pdf) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    const pdfFileName = `${Date.now()}-${pdf.originalFilename}`;
    const pdfFolder = path.join(process.cwd(), "public/pdfs");
    if (!fs.existsSync(pdfFolder)) fs.mkdirSync(pdfFolder, { recursive: true });
    const pdfDest = path.join(pdfFolder, pdfFileName);
    fs.renameSync(pdf.filepath, pdfDest);

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const note = await prisma.note.create({
      data: {
        title,
        description,
        category,
        pdfFile: `/pdfs/${pdfFileName}`,
        slug,
        userId: session.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (err: any) {
    console.error("Failed to create note:", err);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
