import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type MediaType = "image" | "video" | "audio" | "file";

export interface MediaFile {
  uri: string;
  type: MediaType;
  name: string;
  size: number;
  mimeType: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac"],
  file: ["application/pdf", "application/zip", "application/x-rar-compressed"],
};

export const pickImage = async (): Promise<MediaFile | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (fileInfo.exists && (fileInfo as any).size && (fileInfo as any).size > MAX_FILE_SIZE) {
        Alert.alert("خطأ", "حجم الملف كبير جداً (الحد الأقصى 100MB)");
        return null;
      }

      return {
        uri: asset.uri,
        type: "image",
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: (fileInfo as any).size || 0,
        mimeType: "image/jpeg",
      };
    }
    return null;
  } catch (error) {
    Alert.alert("خطأ", "فشل اختيار الصورة");
    return null;
  }
};

export const pickVideo = async (): Promise<MediaFile | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (fileInfo.exists && (fileInfo as any).size && (fileInfo as any).size > MAX_FILE_SIZE) {
        Alert.alert("خطأ", "حجم الملف كبير جداً (الحد الأقصى 100MB)");
        return null;
      }

      return {
        uri: asset.uri,
        type: "video",
        name: asset.fileName || `video_${Date.now()}.mp4`,
        size: (fileInfo as any).size || 0,
        mimeType: "video/mp4",
      };
    }
    return null;
  } catch (error) {
    Alert.alert("خطأ", "فشل اختيار الفيديو");
    return null;
  }
};

export const uploadMediaToS3 = async (
  mediaFile: MediaFile,
  token: string
): Promise<string | null> => {
  try {
    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(mediaFile.uri, {
      encoding: "base64" as any,
    });

    // Upload to server (which will handle S3 upload)
    const response = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: mediaFile.name,
        fileData: base64Data,
        mimeType: mediaFile.mimeType,
        type: mediaFile.type,
      }),
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url; // S3 URL
  } catch (error) {
    Alert.alert("خطأ", "فشل تحميل الملف");
    return null;
  }
};

export const compressImage = async (imageUri: string): Promise<string> => {
  try {
    const manipResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6, // Compress to 60% quality
    });

    if (!manipResult.canceled && manipResult.assets[0]) {
      return manipResult.assets[0].uri;
    }
    return imageUri;
  } catch (error) {
    return imageUri;
  }
};

export const getFileSizeInMB = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
