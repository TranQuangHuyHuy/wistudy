export interface GalleryImage {
  id: string;
  name: string;
  src: string;
}

// Thêm ảnh vào thư mục public/gallery/ và cập nhật danh sách bên dưới
// Ví dụ: thêm file "my-image.jpg" vào public/gallery/
// rồi thêm { id: 'my-image', name: 'My Image', src: '/gallery/my-image.jpg' }

export const galleryImages: GalleryImage[] = [
  // Thêm ảnh của bạn vào đây, ví dụ:
  // { id: 'cafe', name: 'Quán cà phê', src: '/gallery/cafe.jpg' },
  // { id: 'beach', name: 'Bãi biển', src: '/gallery/beach.jpg' },
];
