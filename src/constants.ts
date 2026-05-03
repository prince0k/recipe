import { Recipe, Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'healthy',
    name: 'Healthy Recipes',
    description: 'Nourish your body',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
    icon: 'Leaf'
  },
  {
    id: 'quick',
    name: 'Quick Meals',
    description: 'Under 30 mins',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    icon: 'Timer'
  },
  {
    id: 'budget',
    name: 'Budget Friendly',
    description: 'Cost-effective',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop',
    icon: 'Banknote'
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    description: 'Start right',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=2070&auto=format&fit=crop',
    icon: 'Coffee'
  },
  {
    id: 'dinner',
    name: 'Dinner',
    description: 'Main events',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop',
    icon: 'Utensils'
  }
];

export const RECIPES: Recipe[] = [
  {
    id: 'heirloom-tomato-galette',
    title: 'Rustic Heirloom Tomato Galette',
    summary: 'A celebration of late summer. This free-form tart features a buttery, flaky crust enveloping peak-season heirloom tomatoes, caramelized onions, and sharp Gruyère cheese.',
    image: 'https://images.unsplash.com/photo-1621801306168-d97a0217660c?q=80&w=1770&auto=format&fit=crop',
    time: '1h 15m',
    difficulty: 'Medium',
    calories: 450,
    rating: 4.8,
    reviewCount: 124,
    category: 'Dinner',
    isFeatured: true,
    tags: ['Vegetarian', 'Autumn'],
    ingredients: [
      {
        section: 'For the Pastry',
        items: ['1 ½ cups all-purpose flour', '½ tsp kosher salt', '10 tbsp unsalted butter, cold & cubed', '3-4 tbsp ice water']
      },
      {
        section: 'For the Filling',
        items: ['1 ½ lbs mixed heirloom tomatoes', '1 cup Gruyère cheese, grated', '1 large yellow onion, caramelized', 'Fresh thyme and flaky sea salt']
      }
    ],
    instructions: [
      {
        section: 'Process',
        steps: [
          { title: 'Prepare the dough', content: 'In a large bowl, whisk together the flour and salt. Cut in the cold, cubed butter...' },
          { title: 'Chill and Prep', content: 'Form the dough into a rough disk, wrap tightly in plastic wrap, and refrigerate...' },
          { title: 'Assemble the Galette', content: 'Preheat your oven to 400°F (200°C). Roll out the chilled dough...' },
          { title: 'Bake and Serve', content: 'Brush the folded crust edges with an egg wash. Bake for 35-40 minutes...' }
        ]
      }
    ],
    nutrition: {
      calories: 450,
      totalFat: '28g',
      saturatedFat: '16g',
      carbohydrates: '36g',
      fiber: '3g',
      protein: '12g'
    }
  },
  {
    id: 'mushroom-pappardelle',
    title: 'Rustic Mushroom Pappardelle',
    summary: 'A mouth-watering close-up of a rustic bowl of steaming pasta coated in a rich, velvety mushroom cream sauce.',
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1994&auto=format&fit=crop',
    time: '35 Min',
    difficulty: 'Medium',
    calories: 520,
    rating: 4.9,
    reviewCount: 89,
    category: 'Dinner',
    isTrending: true,
    ingredients: [],
    instructions: [],
    nutrition: { calories: 520, totalFat: '22g', saturatedFat: '12g', carbohydrates: '65g', fiber: '4g', protein: '15g' }
  },
  {
    id: 'harvest-bowl',
    title: 'Autumn Harvest Bowl',
    summary: 'A hearty harvest bowl with roasted sweet potatoes, quinoa, deep green spinach, and bright red pomegranate seeds.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    time: '20 Min',
    difficulty: 'Easy',
    calories: 380,
    rating: 4.7,
    reviewCount: 56,
    category: 'Lunch',
    isTrending: true,
    ingredients: [],
    instructions: [],
    nutrition: { calories: 380, totalFat: '12g', saturatedFat: '2g', carbohydrates: '58g', fiber: '12g', protein: '10g' }
  },
  {
    id: 'berry-galette',
    title: 'Rustic Berry Galette',
    summary: 'A tactile, moody close-up of a rustic mixed berry galette resting on a piece of crinkled parchment paper.',
    image: 'https://images.unsplash.com/photo-1621801306385-61c02888258e?q=80&w=1770&auto=format&fit=crop',
    time: '55 Min',
    difficulty: 'Medium',
    calories: 320,
    rating: 5.0,
    reviewCount: 42,
    category: 'Dessert',
    ingredients: [],
    instructions: [],
    nutrition: { calories: 320, totalFat: '18g', saturatedFat: '10g', carbohydrates: '42g', fiber: '3g', protein: '4g' }
  }
];
