export interface Chat {
  id: string;
  title?: string;
  updatedAt: number;
  createdAt: number;
}

export interface GroupedChats {
  [date: string]: Chat[];
}
