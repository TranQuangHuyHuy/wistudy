import { Background } from '@/types/wistudy';

export const backgrounds: Background[] = [
  {
    id: 'library',
    name: 'Library',
    nameVi: 'Thư viện',
    preview: '/backgrounds/library.png',
    prompt: 'A cozy modern library with warm lighting, wooden bookshelves filled with books, comfortable study desks, large windows with natural light, peaceful studying atmosphere'
  },
  {
    id: 'classroom',
    name: 'Home Study Room',
    nameVi: 'Phòng học',
    preview: '/backgrounds/classroom.jpg',
    prompt: 'A cozy home study room with a wooden desk near a large window, natural sunlight, bookshelf with books, desk lamp, potted plants, warm and inviting study atmosphere'
  },
  {
    id: 'rain',
    name: 'Rainy Day',
    nameVi: 'Mưa',
    preview: '/backgrounds/rain.jpg',
    prompt: 'A cozy room with large window showing rain outside, raindrops on glass, soft lighting, comfortable study desk, peaceful rainy day atmosphere, warm indoor feeling'
  },
  {
    id: 'snow',
    name: 'Snowy Day',
    nameVi: 'Tuyết',
    preview: '/backgrounds/snow.jpg',
    prompt: 'A warm cozy room with large window showing snowy winter scene outside, snow falling, soft warm lighting inside, hot drink on desk, peaceful winter study atmosphere'
  }
];
