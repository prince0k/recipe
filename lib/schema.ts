export function generateRecipeSchema(recipe: any) {
  return JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.title,
    "image": recipe.coverImage ? [recipe.coverImage] : [],
    "author": {
      "@type": "Person",
      "name": "Stewart Lucas"
    },
    "datePublished": new Date(recipe.createdAt).toISOString(),
    "description": recipe.excerpt,
  });
}

export function generateArticleSchema(article: any) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.coverImage ? [article.coverImage] : [],
    "datePublished": new Date(article.createdAt).toISOString(),
    "author": [{
        "@type": "Person",
        "name": "Stewart Lucas",
      }]
  });
}
