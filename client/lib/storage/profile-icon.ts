const KEY = "chithra-profile-icon";

const DEFAULT_ICON = "3d-cartoon-avatar-man-minimal-3d-character-avatar-profile_652053-2067.jpg";

export function getProfileIcon(): string {
  if (typeof window === "undefined") return DEFAULT_ICON;
  return localStorage.getItem(KEY) || DEFAULT_ICON;
}

export function setProfileIcon(icon: string) {
  localStorage.setItem(KEY, icon);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("profileIconChanged", { detail: icon }));
  }
}

export const PROFILE_ICONS = [
  "3d-cartoon-avatar-man-minimal-3d-character-avatar-profile_652053-2067.jpg",
  "3d-cartoon-avatar-girl-minimal-3d-character_652053-2327.jpg",
  "3d-cartoon-avatar-girl-minimal-3d-character_652053-2348.jpg",
  "charming-3d-cartoon-male-with-brown-hair-smiling-expression_1295952-729.jpg",
  "0b976f0a7aa1aa43870e1812eee5a55d.jpg",
  "1707746429259.jpg",
  "381d6edab2cb8693e04e9e5923c20ec6.jpg",
  "6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg",
  "8c6ddb5fe6600fcc4b183cb2ee228eb7.jpg",
  "9fdbf4c61a5e5e91878cb7e59655e4a2.jpg",
];
