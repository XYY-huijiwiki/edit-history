type UpdateWikiOptions = {
  apiUrl: string;
  username: string;
  password: string;
  pageName: string;
  content: string;
  summary?: string;
  token: string;
};

export async function updateWikiPage(
  options: UpdateWikiOptions
): Promise<void> {
  const { apiUrl, username, password, pageName, content, summary, token } =
    options;

  let cookies: string[] = [];

  // Helper to run fetch with stored cookies
  async function fetch2(url: string, init?: any) {
    const headers = new Headers(init?.headers ?? {});
    if (cookies.length > 0) {
      headers.set("Cookie", cookies.join("; "));
    }
    headers.set("X-authkey", token);

    const res = await fetch(url, { ...init, headers });

    // Korrekte Cookie-Auswertung (Node.js / undici)
    const raw = (res as any).headers?.raw?.();
    const setCookieList: string[] | undefined = raw
      ? raw["set-cookie"]
      : undefined;

    if (setCookieList && setCookieList.length > 0) {
      // Map nach Cookie-Namen zur Vermeidung von Duplikaten
      const jar: Record<string, string> = {};
      for (const c of cookies) {
        const [name] = c.split("=");
        jar[name] = c;
      }
      for (const sc of setCookieList) {
        const trimmed = sc.split(";")[0];
        const [name] = trimmed.split("=");
        jar[name] = trimmed;
      }
      cookies = Object.values(jar);
    }

    return res;
  }

  // 1. Get login token
  const tokenRes = await fetch2(
    `${apiUrl}?action=query&meta=tokens&type=login&format=json`
  );
  const tokenData = await tokenRes.json();
  console.log(tokenData);
  const loginToken = tokenData?.query?.tokens?.logintoken;
  if (!loginToken) throw new Error("Failed to get login token");

  // 2. Do clientlogin
  const loginParams = new URLSearchParams({
    action: "clientlogin",
    username,
    password,
    loginreturnurl: "http://localhost/", // dummy URL
    logintoken: loginToken,
    format: "json",
  });

  const loginRes = await fetch2(apiUrl, {
    method: "POST",
    body: loginParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const loginData = await loginRes.json();
  console.log(loginData);
  if (loginData?.clientlogin?.status !== "PASS") {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }

  // 3. Get CSRF token
  const csrfRes = await fetch2(
    `${apiUrl}?action=query&meta=tokens&type=csrf&format=json`
  );
  const csrfData = await csrfRes.json();
  console.log(csrfData);
  const csrfToken = csrfData?.query?.tokens?.csrftoken;
  if (!csrfToken) throw new Error("Failed to get CSRF token");

  // 4. Edit page
  const editParams = new URLSearchParams({
    action: "edit",
    title: pageName,
    text: content,
    summary: summary ?? "Automated update",
    token: csrfToken,
    format: "json",
  });

  const editRes = await fetch2(apiUrl, {
    method: "POST",
    body: editParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const editData = await editRes.json();
  console.log(editData);
  if (editData?.error) {
    throw new Error(`Edit failed: ${JSON.stringify(editData.error)}`);
  }

  console.log(`✅ Page "${pageName}" updated successfully.`);
}

await updateWikiPage({
  apiUrl: "https://xyy.huijiwiki.com/w/api.php",
  username: "卡丁",
  password: "961vqpaohsf71e1mfnk049nqfao12d73",
  pageName: "Html:测试",
  content: "Your content here",
  summary: "Your summary here",
  token: "W7WWRWm1TMpYtu",
});
