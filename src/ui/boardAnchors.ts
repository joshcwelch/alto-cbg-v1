export const BOARD_BASE = { W: 1280, H: 640 };

export const ANCHORS = {
  battlefieldTop: 0.40625, // 260 / 640
  battlefieldHeight: 0.28125, // 180 / 640
  battlefieldGap: 0.03125, // 40 / 1280
  handTop: 0.75, // 480 / 640
  handHeight: 0.3125, // 200 / 640
  handGap: 0.015625, // 20 / 1280
  cardSpacing: 0.125 // 160 / 1280
};

export const LANES = {
  left: { top: 0.32, height: 0.14 },
  center: { top: 0.46, height: 0.14 },
  right: { top: 0.6, height: 0.14 }
};
