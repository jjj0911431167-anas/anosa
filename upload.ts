import { z } from "zod";
import { publicProcedure, router } from "@/server/_core/trpc";

export const uploadRouter = router({
  uploadFile: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        type: z.enum(["image", "video", "audio", "file"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In production, this would upload to S3 via the storage proxy
        // For now, we'll return a mock URL
        const timestamp = Date.now();
        const fileExtension = input.fileName.split(".").pop();
        const storagePath = `uploads/${input.type}/${timestamp}-${input.fileName}`;

        // Mock S3 URL (in production, use actual S3 upload)
        const mockUrl = `https://storage.example.com/${storagePath}`;

        return {
          success: true,
          url: mockUrl,
          path: storagePath,
          size: Math.round((input.fileData.length * 3) / 4), // Approximate size
          mimeType: input.mimeType,
          uploadedAt: new Date(),
        };
      } catch (error) {
        throw new Error("Failed to upload file");
      }
    }),

  uploadProfilePicture: publicProcedure
    .input(
      z.object({
        fileData: z.string(), // base64
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("Unauthorized");
        }

        const timestamp = Date.now();
        const storagePath = `profile-pictures/${userId}-${timestamp}.jpg`;
        const mockUrl = `https://storage.example.com/${storagePath}`;

        return {
          success: true,
          url: mockUrl,
          path: storagePath,
          uploadedAt: new Date(),
        };
      } catch (error) {
        throw new Error("Failed to upload profile picture");
      }
    }),

  uploadStoryMedia: publicProcedure
    .input(
      z.object({
        fileData: z.string(), // base64
        mimeType: z.string(),
        type: z.enum(["image", "video", "audio"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("Unauthorized");
        }

        const timestamp = Date.now();
        const fileExtension = input.type === "image" ? "jpg" : input.type === "video" ? "mp4" : "mp3";
        const storagePath = `stories/${userId}/${timestamp}.${fileExtension}`;
        const mockUrl = `https://storage.example.com/${storagePath}`;

        return {
          success: true,
          url: mockUrl,
          path: storagePath,
          type: input.type,
          uploadedAt: new Date(),
        };
      } catch (error) {
        throw new Error("Failed to upload story media");
      }
    }),

  deleteFile: publicProcedure
    .input(
      z.object({
        path: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In production, this would delete from S3
        return {
          success: true,
          message: "File deleted successfully",
        };
      } catch (error) {
        throw new Error("Failed to delete file");
      }
    }),
});
