export interface Character {
  id: number;
  name: string;
  surname: string;
  quote: string;
  type: 'PC' | 'NPC';
  profession: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  appearance: string;
  history: string;
  personality: string;
  equipment: string;
  money: string;
  skills: string; // Advantages
  disadvantages: string;
  stats: string; // Detailed attributes
  general_stats: string; // PZ, PR, etc
  techniques: string; // Hadou, Bakudou
  avatar_url: string;
  appearance_images?: string; // Comma separated URLs
  current_hp?: number;
  current_pr?: number;
  created_at: string;
}

export interface StatHistory {
  id: number;
  character_id: number;
  stat_name: string;
  amount: number;
  comment: string;
  created_at: string;
}

export interface Post {
  id: number;
  gm_post: string;
  player_post: string;
  manga_panel_url: string;
  created_at: string;
}
