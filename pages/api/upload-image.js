// pages/api/upload-image.js
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // <-- THÊM DÒNG NÀY ĐỂ IMPORT MODULE FS

// Không cần body-parser cho route này vì chúng ta dùng formidable
export const config = {
  api: {
    bodyParser: false, // Tắt body-parser mặc định của Next.js
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export default async function handler(req, res) {
  // Chỉ chấp nhận method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      // Gửi phản hồi lỗi nếu có vấn đề khi phân tích form data
      return res.status(500).json({ success: false, message: 'Error parsing form data' });
    }

    // formidable 3 trả về files dưới dạng mảng, lấy phần tử đầu tiên
    const file = files.file ? files.file[0] : null;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      // Tải lên file lên Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'nextjs-ecom-products', // Tùy chọn: thư mục trên Cloudinary
        resource_type: 'image', // Đảm bảo nó được xử lý như một hình ảnh
      });

      // Xóa file tạm thời sau khi upload xong để giải phóng bộ nhớ
      // file.filepath là đường dẫn của file tạm thời do formidable tạo ra
      await fs.promises.unlink(file.filepath);

      // Gửi URL của ảnh đã tải lên về client
      res.status(200).json({ success: true, imageUrl: result.secure_url });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      // Đảm bảo luôn gửi phản hồi lỗi trong catch block để tránh stalled requests
      res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary', error: uploadError.message });
    }
  });
}