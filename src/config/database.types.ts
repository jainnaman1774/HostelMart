export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          university: string;
          created_at: string;
          listings: number;
          sold: number;
          rating: number;
        };
        Insert: {
          id: string;
          name: string;
          university: string;
          created_at?: string;
          listings?: number;
          sold?: number;
          rating?: number;
        };
        Update: {
          id?: string;
          name?: string;
          university?: string;
          created_at?: string;
          listings?: number;
          sold?: number;
          rating?: number;
        };
      };
    };
  };
}; 