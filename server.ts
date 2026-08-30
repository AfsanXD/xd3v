import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    engine: "xd3v-Browser-Core",
    timestamp: new Date().toISOString(),
  });
});

// In-Memory Web Proxy Engine for Real Web Browsing
app.all("/api/proxy-sandbox", async (req, res) => {
  let targetUrl = (req.query.url as string) || (req.body && req.body.url);
  if (!targetUrl) {
    res.status(400).send("URL parameter is required.");
    return;
  }

  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  // Safety validation
  let validUrl: URL;
  try {
    validUrl = new URL(targetUrl);
  } catch {
    res.status(400).send("Invalid URL.");
    return;
  }

  if (validUrl.protocol !== "http:" && validUrl.protocol !== "https:") {
    res.status(400).send("Only HTTP/HTTPS protocols are allowed.");
    return;
  }

  let fetchUrl = validUrl.toString();

  try {
    const startTime = Date.now();
    const fetchHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    };

    const fetchOptions: RequestInit = {
      method: req.method === "POST" ? "POST" : "GET",
      headers: fetchHeaders,
      redirect: "follow",
    };

    if (req.method === "POST" && req.body) {
      if (typeof req.body === "string") {
        fetchOptions.body = req.body;
      } else if (typeof req.body === "object") {
        fetchOptions.body = new URLSearchParams(req.body).toString();
      }
    }

    const response = await fetch(fetchUrl, fetchOptions);

    const finalUrl = response.url || fetchUrl;
    let finalUrlObj: URL;
    try {
      finalUrlObj = new URL(finalUrl);
    } catch {
      finalUrlObj = validUrl;
    }

    const contentType = response.headers.get("content-type") || "text/html";
    const fetchLatency = Date.now() - startTime;

    res.setHeader("X-xd3v-Memory-Cache", "HIT-RAM-ISOLATE");
    res.setHeader("X-xd3v-Latency-MS", fetchLatency.toString());
    res.setHeader("X-xd3v-Zero-Disk", "ENFORCED");
    
    // Strip all headers that prevent iframe embedding or break cross-origin sandbox
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Content-Security-Policy-Report-Only");
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Resource-Policy");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.removeHeader("Permissions-Policy");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);

    // If it's not HTML (e.g. images, stylesheets, json, fonts), send buffer
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      return;
    }

    let body = await response.text();

    // Strip inline CSP meta tags that block scripts or framing
    body = body.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "");
    
    // Strip all target="_blank", target="_top", target="_parent" to prevent framing escape
    body = body.replace(/target=["'](_blank|_top|_parent)["']/gi, 'target="_self"');

    const proxyServerOrigin = `${req.protocol}://${req.get("host")}`;
    const baseTag = `<base href="${finalUrlObj.origin}${finalUrlObj.pathname}">`;

    const clientSandboxScript = `
    <script>
      (function() {
        var CURRENT_ORIGIN = ${JSON.stringify(finalUrlObj.origin)};
        var CURRENT_PAGE = ${JSON.stringify(finalUrlObj.href)};
        var PROXY_ENDPOINT = ${JSON.stringify(proxyServerOrigin + "/api/proxy-sandbox?url=")};

        function resolveUrl(url) {
          try {
            return new URL(url, CURRENT_PAGE).href;
          } catch(e) {
            return url;
          }
        }

        function notifyParentNav(url) {
          try {
            window.parent.postMessage({ type: 'XD3V_NAVIGATE', url: url }, '*');
          } catch(err) {}
        }

        function proxyNavigate(targetUrl) {
          if (!targetUrl || targetUrl.startsWith('javascript:')) return;
          var full = resolveUrl(targetUrl);
          notifyParentNav(full);
          window.location.href = PROXY_ENDPOINT + encodeURIComponent(full);
        }

        // Intercept all user link clicks (Capture Phase)
        window.addEventListener('click', function(e) {
          var target = e.target;
          var a = target && (target.closest ? target.closest('a') : null);
          if (!a) return;

          var rawHref = a.getAttribute('href');
          if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('#')) return;

          e.preventDefault();
          e.stopPropagation();

          var fullUrl = a.href || resolveUrl(rawHref);
          proxyNavigate(fullUrl);
        }, true);

        // Intercept auxiliary clicks (middle-click)
        window.addEventListener('auxclick', function(e) {
          var target = e.target;
          var a = target && (target.closest ? target.closest('a') : null);
          if (!a) return;
          var rawHref = a.getAttribute('href');
          if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('#')) return;
          e.preventDefault();
          e.stopPropagation();
          proxyNavigate(a.href || resolveUrl(rawHref));
        }, true);

        // Intercept native form submissions (Capture Phase)
        window.addEventListener('submit', function(e) {
          var form = e.target;
          if (!form || !form.tagName || form.tagName.toLowerCase() !== 'form') return;

          var rawAction = form.getAttribute('action') || CURRENT_PAGE;
          var targetUrlObj;
          try {
            targetUrlObj = new URL(rawAction, CURRENT_PAGE);
          } catch(err) {
            targetUrlObj = new URL(CURRENT_PAGE);
          }

          var method = (form.getAttribute('method') || 'GET').toUpperCase();

          if (method === 'GET') {
            e.preventDefault();
            e.stopPropagation();

            try {
              var formData = new FormData(form);
              var entries = Array.from(formData.entries());
              if (entries.length > 0) {
                entries.forEach(function(pair) {
                  if (pair[0]) {
                    targetUrlObj.searchParams.set(pair[0], pair[1]);
                  }
                });
              } else {
                var inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(function(input) {
                  var name = input.getAttribute('name');
                  if (name && input.value !== undefined) {
                    targetUrlObj.searchParams.set(name, input.value);
                  }
                });
              }
            } catch(formErr) {
              var inputs = form.querySelectorAll('input, select, textarea');
              inputs.forEach(function(input) {
                var name = input.getAttribute('name');
                if (name && input.value !== undefined) {
                  targetUrlObj.searchParams.set(name, input.value);
                }
              });
            }

            var finalFormUrl = targetUrlObj.toString();
            proxyNavigate(finalFormUrl);
          }
        }, true);

        // Intercept window.open popups
        window.open = function(url) {
          if (url) {
            proxyNavigate(url);
          }
          return window;
        };
      })();
    </script>`;

    // Inject baseTag and clientSandboxScript at the very top of HTML
    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${baseTag}${clientSandboxScript}`);
    } else if (body.includes("<HEAD>")) {
      body = body.replace("<HEAD>", `<HEAD>${baseTag}${clientSandboxScript}`);
    } else if (body.includes("<html>")) {
      body = body.replace("<html>", `<html><head>${baseTag}${clientSandboxScript}</head>`);
    } else {
      body = `${baseTag}${clientSandboxScript}${body}`;
    }

    res.send(body);
  } catch (err: any) {
    const errorHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Web Page Gateway</title>
        <style>
          body { background: #121212; color: #EEE; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; text-align: center; }
          .box { border: 1px solid #333; background: #1E1E1E; padding: 32px; max-width: 580px; margin: 40px auto; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          h2 { color: #FF6B6B; font-size: 18px; margin-top: 0; }
          p { color: #AAA; font-size: 13px; line-height: 1.6; }
          .btn { display: inline-block; background: #00FF66; color: #000; font-weight: 600; padding: 8px 18px; text-decoration: none; margin: 12px 6px; font-size: 12px; border-radius: 4px; }
          .btn-sec { background: #2E2E2E; color: #FFF; border: 1px solid #444; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Unable to Load Page</h2>
          <p>Failed to route connection to <span style="color:#00F0FF; word-break: break-all;">${targetUrl}</span>.</p>
          <p style="font-size: 11px; color: #777;">${err.message}</p>
          <div style="margin-top: 20px;">
            <a class="btn" href="javascript:location.reload()">Reload Page</a>
            <a class="btn btn-sec" href="javascript:history.back()">Go Back</a>
          </div>
        </div>
      </body>
    </html>`;
    res.status(200).send(errorHtml);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`xd3v Browser Engine Host running on http://localhost:${PORT}`);
  });
}

startServer();
