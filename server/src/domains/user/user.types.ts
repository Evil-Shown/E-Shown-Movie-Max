import type { UserSettings } from "../../../generated/prisma";

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
}

export interface UpdatePreferencesInput {
  language?: string;
  autoplay?: boolean;
  preferredProvider?: string;
  subtitleLang?: string;
  quality?: string;
  notifications?: boolean;
  theme?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  settings: UserSettings | null;
  createdAt: Date;
}
