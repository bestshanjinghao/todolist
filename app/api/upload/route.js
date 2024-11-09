import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 确保目录存在的辅助函数
async function ensureDir(dirPath) {
  try {
    await access(dirPath);
  } catch (error) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 获取文件的字节数据
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一的文件名
    const fileName = `${uuidv4()}${path.extname(file.name)}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await ensureDir(uploadDir);

    // 写入文件
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 返回文件URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '文件上传失败' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
}; 