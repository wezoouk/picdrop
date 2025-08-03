
export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploaderName: string;
  timestamp: number;
  isPublic: boolean;
  isSensitive?: boolean;
  isPrivate?: boolean;
}
