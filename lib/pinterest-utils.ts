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
    position: "top" | "bottom" | "center";
    style: "dark" | "light" | "accent";
    title: string; // The badge text (e.g. "NUTRIGUIDE")
  }
): Promise<Buffer> {
  const image = sharp(imageBufferOrPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1000;
  const height = metadata.height || 1500;

  // Make sure we have a nice high-quality card size
  const boxHeight = Math.floor(height * 0.28);
  const padding = 40;
  
  let boxY = 0;
  if (options.position === "bottom") {
    boxY = height - boxHeight - padding;
  } else if (options.position === "center") {
    boxY = Math.floor((height - boxHeight) / 2);
  } else {
    boxY = padding;
  }

  // Styles definition
  let bgColor = "rgba(18, 18, 18, 0.85)"; // dark semi-transparent
  let textColor = "#ffffff";
  let badgeBgColor = "rgba(230, 0, 35, 0.9)"; // Brand red
  let badgeTextColor = "#ffffff";

  if (options.style === "light") {
    bgColor = "rgba(255, 255, 255, 0.94)";
    textColor = "#111111";
    badgeBgColor = "rgba(18, 18, 18, 0.9)";
  } else if (options.style === "accent") {
    bgColor = "rgba(230, 0, 35, 0.92)"; // accent brand background card
    textColor = "#ffffff";
    badgeBgColor = "rgba(255, 255, 255, 0.95)";
    badgeTextColor = "#e60023";
  }

  // Escape XML characters
  const escapeXml = (str: string) => {
    return str.replace(/[<>&'"]/g, (c) => {
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

  // Word wrap text
  const maxLineLength = 22;
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

  const displayLines = lines.slice(0, 3);
  const fontSize = displayLines.length > 2 ? 40 : 46;
  const lineSpacing = fontSize + 12;
  const startTextY = Math.floor((boxHeight - (displayLines.length * lineSpacing)) / 2) + fontSize - 10;

  const textElements = displayLines
    .map((line, index) => {
      return `<text x="50%" y="${boxY + startTextY + index * lineSpacing}" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}px" fill="${textColor}" text-anchor="middle">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const badgeText = escapeXml(options.title.toUpperCase());
  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.18" />
        </filter>
      </defs>
      
      <!-- Card Box with Shadow and Rounded Corners -->
      <rect x="${padding}" y="${boxY}" width="${width - padding * 2}" height="${boxHeight}" rx="20" fill="${bgColor}" filter="url(#shadow)" />
      
      <!-- Brand Pill Badge -->
      <g transform="translate(${width / 2 - 110}, ${boxY - 18})">
        <rect x="0" y="0" width="220" height="36" rx="18" fill="${badgeBgColor}" />
        <text x="110" y="23" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="800" font-size="13px" fill="${badgeTextColor}" text-anchor="middle" letter-spacing="2">${badgeText}</text>
      </g>
      
      <!-- Text Lines -->
      ${textElements}
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
