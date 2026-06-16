import sharp from "sharp";

// Environment-based Pinterest API base URL
const getBaseUrl = () => {
  return process.env.PINTEREST_ENV === "sandbox"
    ? "https://api-sandbox.pinterest.com/v5"
    : "https://api.pinterest.com/v5";
};

/**
 * Make a request to the Pinterest V5 API.
 */
export async function pinterestRequest(path: string, token: string, options: any = {}) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Pinterest API error (${res.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Gets a board ID matching boardName, or creates it if it doesn't exist.
 */
export async function getOrCreateBoard(boardName: string, token: string): Promise<string> {
  console.log(`🔍 Checking boards on Pinterest for: "${boardName}"`);
  const boardsData = await pinterestRequest("/boards", token);
  const boards = boardsData.items || [];
  
  const existingBoard = boards.find(
    (b: any) => b.name.trim().toLowerCase() === boardName.trim().toLowerCase()
  );

  if (existingBoard) {
    console.log(`✅ Found existing board: "${existingBoard.name}" (${existingBoard.id})`);
    return existingBoard.id;
  }

  console.log(`➕ Board "${boardName}" not found. Creating it...`);
  const newBoard = await pinterestRequest("/boards", token, {
    method: "POST",
    body: JSON.stringify({
      name: boardName,
      description: `Fresh collections matching ${boardName} guidelines by NutriGuide.`,
      privacy: "PUBLIC"
    })
  });

  console.log(`✅ Created board: "${newBoard.name}" (${newBoard.id})`);
  return newBoard.id;
}

/**
 * Creates a Pin on Pinterest.
 */
export async function createPinterestPin({
  token,
  boardId,
  title,
  description,
  link,
  imageUrl,
}: {
  token: string;
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}) {
  return pinterestRequest("/pins", token, {
    method: "POST",
    body: JSON.stringify({
      board_id: boardId,
      title: title.substring(0, 100),
      description: description.substring(0, 500),
      link,
      media_source: {
        source_type: "image_url",
        url: imageUrl,
      },
    }),
  });
}

/**
 * Uploads a local image buffer to ImgBB and returns the public CDN URL.
 */
export async function uploadToImgBB(imageBuffer: Buffer, apiKey: string): Promise<string> {
  const base64Image = imageBuffer.toString("base64");
  const formData = new URLSearchParams();
  formData.append("image", base64Image);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ImgBB upload failed: ${text}`);
  }

  const data = await res.json();
  if (data?.data?.url) {
    return data.data.url;
  }
  throw new Error("ImgBB response did not contain image URL");
}

/**
 * Composites a styled SVG text card overlay onto an image using sharp.
 */
export async function applyTextOverlay(
  imageBufferOrPath: Buffer | string,
  text: string,
  options: {
    position?: "top" | "bottom" | "center"; // kept for backward compatibility but ignored
    style?: "dark" | "light" | "accent";    // kept for backward compatibility but ignored
    title: string; // The badge text (e.g. "NUTRIGUIDE")
    contentType?: string; // "RECIPE" | "BLOG" | "DIET_PLAN" | "CHEAT_SHEET"
    meta?: {
      cookingTime?: string | number | null;
      prepTime?: string | number | null;
      calories?: string | number | null;
      protein?: string | number | null;
      carbs?: string | number | null;
      fat?: string | number | null;
      benefits?: string | string[];
      dos?: string;
      donts?: string;
      category?: string;
      readTime?: string;
    };
  }
): Promise<Buffer> {
  const image = sharp(imageBufferOrPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1000;
  const height = metadata.height || 1500;

  const panelW = Math.floor(width * 0.42);

  // Escape XML characters
  const escapeXml = (str: string) => {
    return String(str).replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case "\"": return "&quot;";
        default: return c;
      }
    });
  };

  // Word wrap title text (narrow left panel, so wrap tightly)
  const maxLineLength = 15;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxLineLength) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = (currentLine + " " + word).trim();
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  const displayLines = lines.slice(0, 4);
  const fontSize = displayLines.length > 3 ? 30 : 36;
  const lineSpacing = fontSize + 10;
  
  // Center the title block around y = 400
  const titleBlockHeight = displayLines.length * lineSpacing;
  const startTitleY = 400 - Math.floor(titleBlockHeight / 2) + fontSize - 10;

  const titleElements = displayLines
    .map((line, index) => {
      return `<text x="${panelW / 2}" y="${startTitleY + index * lineSpacing}" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}px" fill="#FFFFFF" text-anchor="middle">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const badgeText = escapeXml((options.title || "NUTRIGUIDE").toUpperCase());
  const typeLabel = escapeXml((options.contentType || "BLOG").replace(/_/g, " ").toUpperCase());

  // Dynamic Metadata Section based on contentType
  let metaSvg = "";
  const rawType = (options.contentType || "BLOG").toUpperCase().replace(/_/g, "");
  const meta = options.meta || {};

  const formatTime = (timeVal: any) => {
    if (!timeVal) return "";
    const str = String(timeVal).trim();
    if (str.toLowerCase().includes("min") || str.toLowerCase().includes("m")) return str;
    return `${str} mins`;
  };

  const formatCalories = (calVal: any) => {
    if (!calVal) return "";
    const str = String(calVal).trim();
    if (str.toLowerCase().includes("kcal") || str.toLowerCase().includes("cal")) return str;
    return `${str} kcal`;
  };

  const formatProtein = (protVal: any) => {
    if (!protVal) return "";
    const str = String(protVal).trim();
    if (str.toLowerCase().includes("g")) return str;
    return `${str}g Protein`;
  };

  if (rawType === "RECIPE") {
    const prep = formatTime(meta.prepTime) || "15 mins";
    const cook = formatTime(meta.cookingTime) || "25 mins";
    const timeText = `${prep} prep | ${cook} cook`;
    const cals = formatCalories(meta.calories) || "340 kcal";
    const proteinText = formatProtein(meta.protein) || "25g Protein";

    let macroLabel = "PROTEIN";
    let macroVal = proteinText;
    if (meta.carbs || meta.fat) {
      macroLabel = "MACROS";
      const carbsText = meta.carbs ? (String(meta.carbs).includes("g") ? String(meta.carbs) : `${meta.carbs}g carbs`) : "";
      const fatText = meta.fat ? (String(meta.fat).includes("g") ? String(meta.fat) : `${meta.fat}g fat`) : "";
      macroVal = `${proteinText.replace(" Protein", "g P")} | ${carbsText.replace(" carbs", "g C")} | ${fatText.replace(" fat", "g F")}`.trim().replace(/^\||\|$/g, "").trim();
    }

    metaSvg = `
      <g transform="translate(30, 680)">
        <text x="0" y="25" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">COOK TIME</text>
        <text x="0" y="50" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(timeText)}</text>
        
        <text x="0" y="105" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">CALORIES</text>
        <text x="0" y="130" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(cals)}</text>
        
        <text x="0" y="185" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">${macroLabel}</text>
        <text x="0" y="210" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(macroVal)}</text>
      </g>
    `;
  } else if (rawType === "DIETPLAN" || rawType === "MEALPLAN" || rawType === "DIET_PLAN" || rawType === "MEAL_PLAN") {
    const benefitsList: string[] = [];
    if (meta.benefits) {
      if (Array.isArray(meta.benefits)) {
        benefitsList.push(...meta.benefits);
      } else {
        benefitsList.push(...String(meta.benefits).split(",").map(b => b.trim()));
      }
    }
    if (benefitsList.length === 0) {
      benefitsList.push("Hormone Balance", "Anti-Inflammatory", "7-Day Protocol");
    }

    const displayBenefits = benefitsList.slice(0, 3);
    
    metaSvg = `
      <g transform="translate(30, 680)">
        <text x="0" y="25" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">CORE BENEFITS</text>
    `;
    
    displayBenefits.forEach((benefit, index) => {
      const yLabel = 60 + index * 45;
      const yBullet = yLabel - 5;
      metaSvg += `
        <!-- Custom Bullet Point -->
        <circle cx="6" cy="${yBullet}" r="4" fill="#FF4D4D" />
        <text x="20" y="${yLabel}" font-family="'Inter', sans-serif" font-weight="700" font-size="15px" fill="#FFFFFF">${escapeXml(benefit)}</text>
      `;
    });
    
    metaSvg += `</g>`;
  } else if (rawType === "CHEATSHEET" || rawType === "CHEAT_SHEET") {
    const dos = meta.dos || "Whole Foods Only";
    const donts = meta.donts || "Processed Sugars";

    metaSvg = `
      <g transform="translate(30, 680)">
        <!-- DO BADGE -->
        <rect x="0" y="10" width="45" height="20" rx="4" fill="#00E676" />
        <text x="22.5" y="24" font-family="'Inter', sans-serif" font-weight="900" font-size="10px" fill="#121214" text-anchor="middle">DO</text>
        <text x="0" y="55" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(dos)}</text>
        
        <!-- DON'T BADGE -->
        <rect x="0" y="95" width="55" height="20" rx="4" fill="#FF1744" />
        <text x="27.5" y="109" font-family="'Inter', sans-serif" font-weight="900" font-size="10px" fill="#FFFFFF" text-anchor="middle">DON'T</text>
        <text x="0" y="140" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(donts)}</text>
      </g>
    `;
  } else {
    // Blog / Fallback
    const category = meta.category || "Wellness Guide";
    const readTime = meta.readTime || "5 Min Read";

    metaSvg = `
      <g transform="translate(30, 680)">
        <text x="0" y="25" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">READ TIME</text>
        <text x="0" y="50" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(readTime)}</text>
        
        <text x="0" y="115" font-family="'Inter', sans-serif" font-weight="800" font-size="12px" fill="#FF4D4D" letter-spacing="1.5px">CATEGORY</text>
        <text x="0" y="140" font-family="'Inter', sans-serif" font-weight="700" font-size="16px" fill="#FFFFFF">${escapeXml(category)}</text>
      </g>
    `;
  }

  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <!-- Left translucent glassmorphism column background -->
      <rect x="0" y="0" width="${panelW}" height="${height}" fill="rgba(18, 18, 20, 0.82)" />
      <line x1="${panelW}" y1="0" x2="${panelW}" y2="${height}" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
      
      <!-- Brand Badge -->
      <text x="${panelW / 2}" y="100" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="800" font-size="14px" fill="#E60023" text-anchor="middle" letter-spacing="4px">${badgeText}</text>
      
      <!-- Content Type Pill -->
      <g transform="translate(${panelW / 2 - 60}, 130)">
        <rect x="0" y="0" width="120" height="24" rx="12" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
        <text x="60" y="16" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="10px" fill="#CCCCCC" text-anchor="middle" letter-spacing="1.5px">${typeLabel}</text>
      </g>
      
      <!-- Main wrapped Title -->
      ${titleElements}
      
      <!-- Separator line -->
      <line x1="30" y1="640" x2="${panelW - 30}" y2="640" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
      
      <!-- Dynamic Metadata -->
      ${metaSvg}
      
      <!-- Bottom Website Signature -->
      <text x="${panelW / 2}" y="${height - 75}" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="11px" fill="#666666" text-anchor="middle" letter-spacing="2px">NUTRIGUIDE.COM</text>
    </svg>
  `;

  return await image
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
