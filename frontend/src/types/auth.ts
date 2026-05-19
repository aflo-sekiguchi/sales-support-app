export type User = {
  name: string;
  email: string;
};

export type AuthContextType = { user: User | null };
