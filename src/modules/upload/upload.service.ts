import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'images';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string; size: number }> {
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = `products/${filename}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    // Lay public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);

    return {
      url: publicUrl,
      filename,
      size: file.size,
    };
  }
}
