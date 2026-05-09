import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { app } from './config';

const storage = getStorage(app);

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

export async function uploadItemPhoto(itemModelId, file) {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const storageRef = ref(storage, `item_photos/${itemModelId}`);
  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}
