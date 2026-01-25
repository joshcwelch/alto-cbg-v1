export type ProfileAchievement = {
  id: string;
  title: string;
  progress: number;
  theme: "ember" | "verdant" | "cobalt" | "ruby";
};

export type ProfileData = {
  heroLevel: number;
  heroLevelProgress: number;
  winCount: number;
  highestSeasonRank: string;
  friendsCount: number;
  username: string;
  title: string;
  achievements: ProfileAchievement[];
};

export const profileData: ProfileData = {
  heroLevel: 25,
  heroLevelProgress: 0.65,
  winCount: 343,
  highestSeasonRank: "Gold",
  friendsCount: 27,
  username: "USERNAME",
  title: "TITLE",
  achievements: [
    { id: "ember-spark", title: "ACHIEVMENT TITLE", progress: 78, theme: "ember" },
    { id: "verdant-ward", title: "ACHIEVMENT TITLE", progress: 62, theme: "verdant" },
    { id: "cobalt-flare", title: "ACHIEVMENT TITLE", progress: 46, theme: "cobalt" },
    { id: "ruby-tide", title: "ACHIEVMENT TITLE", progress: 88, theme: "ruby" },
  ],
};
