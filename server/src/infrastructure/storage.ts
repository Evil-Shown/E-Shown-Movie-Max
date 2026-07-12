import { env } from "../config/env";
import { logger } from "../config/logger";
import { supabaseAdmin } from "./supabase";

const STORAGE_BUCKET = "chithra-assets";

export interface StorageUploadResult {
  path: string;
  publicUrl: string;
}

export class StorageService {
  private bucket: string;

  constructor(bucket = STORAGE_BUCKET) {
    this.bucket = bucket;
  }

  async uploadAvatar(file: Buffer, fileName: string, contentType: string): Promise<StorageUploadResult> {
    const path = `avatars/${Date.now()}-${fileName}`;
    return this.upload(path, file, contentType);
  }

  async upload(path: string, file: Buffer, contentType: string): Promise<StorageUploadResult> {
    try {
      const { data, error } = await supabaseAdmin.storage.from(this.bucket).upload(path, file, {
        contentType,
        upsert: true,
      });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(this.bucket).getPublicUrl(data.path);

      return { path: data.path, publicUrl };
    } catch (error) {
      logger.error({ error, path }, "Storage upload failed");
      throw new Error("Failed to upload file");
    }
  }

  async remove(path: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage.from(this.bucket).remove([path]);
      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error({ error, path }, "Storage remove failed");
      throw new Error("Failed to remove file");
    }
  }
}

export const storageService = new StorageService();
