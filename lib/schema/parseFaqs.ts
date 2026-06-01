export function parseFaqs(html: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const htmlStr = html || "";

  // Strategy 1: <details>/<summary> accordion blocks
  const detailsRegex = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi;
  let match;
  while ((match = detailsRegex.exec(htmlStr)) !== null) {
    const question = match[1].replace(/<[^>]*>?/gm, '').trim();
    const answer = match[2].replace(/<[^>]*>?/gm, '').trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  // Strategy 2: <h3>/<h4> headings ending in "?" followed by <p>
  if (faqs.length === 0) {
    const qRegex = /<(h3|h4)[^>]*>([^<]*?\?[^<]*?)<\/\1>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    let qMatch;
    while ((qMatch = qRegex.exec(htmlStr)) !== null) {
      const question = qMatch[2].replace(/<[^>]*>?/gm, '').trim();
      const answer = qMatch[3].replace(/<[^>]*>?/gm, '').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }

  // Deduplicate and limit to 10 pairs
  const seen = new Set<string>();
  const uniqueFaqs = faqs.filter(faq => {
    const key = faq.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueFaqs.slice(0, 10);
}
