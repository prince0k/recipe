
export interface Recipe {
  id: string;
  title: string;
  summary: string;
  image: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  rating: number;
  reviewCount: number;
  category: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  tags?: string[];
  ingredients: {
    section: string;
    items: string[];
  }[];
  instructions: {
    section: string;
    steps: {
      title: string;
      content: string;
    }[];
  }[];
  nutrition: {
    calories: number;
    totalFat: string;
    saturatedFat: string;
    carbohydrates: string;
    fiber: string;
    protein: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}
