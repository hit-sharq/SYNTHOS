export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf", "application/zip", "application/json",
  "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4", "video/quicktime", "audio/mpeg", "audio/wav",
]

const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string | null) || "synthos"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" is not allowed` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timeoutMs = 15000
    try {
      const result = await Promise.race([
        new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder,
                resource_type: "auto",
                use_filename: true,
                unique_filename: true,
              },
              (error, result) => {
                if (error) reject(error)
                else resolve(result)
              }
            )
            .end(buffer)
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Upload timed out. Please try again.")), timeoutMs)
        ),
      ])

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      })
    } catch (cloudinaryError) {
      console.warn("Cloudinary upload failed, using base64 fallback:", cloudinaryError)
      const base64 = buffer.toString("base64")
      const mimeType = file.type || "image/png"
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        url: dataUrl,
        publicId: null,
        format: "base64",
        bytes: buffer.length,
      })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    const message = error?.message || error?.error?.message || "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
