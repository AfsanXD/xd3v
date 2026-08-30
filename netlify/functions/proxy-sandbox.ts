export async function handler(event: any) {
  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing 'url' query parameter" }),
    };
  }

  let fullUrl = targetUrl;
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    fullUrl = "https://" + fullUrl;
  }

  try {
    const finalUrlObj = new URL(fullUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(finalUrlObj.href, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "text/html";
    if (contentType.includes("text/html") || contentType.includes("xhtml")) {
      let body = await response.text();
      body = body.replace(/target=["'](_blank|_top|_parent)["']/gi, 'target="_self"');

      const baseTag = `<base href="${finalUrlObj.origin}${finalUrlObj.pathname}">`;
      const script = `
        <script>
          (function() {
            var CURRENT_ORIGIN = ${JSON.stringify(finalUrlObj.origin)};
            var CURRENT_PAGE = ${JSON.stringify(finalUrlObj.href)};

            function resolveUrl(url) {
              try { return new URL(url, CURRENT_PAGE).href; } catch(e) { return url; }
            }

            function notifyParentNav(url) {
              try { window.parent.postMessage({ type: 'XD3V_NAVIGATE', url: url }, '*'); } catch(err) {}
            }

            function proxyNavigate(targetUrl) {
              if (!targetUrl || targetUrl.startsWith('javascript:')) return;
              var full = resolveUrl(targetUrl);
              notifyParentNav(full);
              window.location.href = '/api/proxy-sandbox?url=' + encodeURIComponent(full);
            }

            window.addEventListener('click', function(e) {
              var a = e.target && e.target.closest ? e.target.closest('a') : null;
              if (!a) return;
              var href = a.getAttribute('href');
              if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
              e.preventDefault();
              e.stopPropagation();
              proxyNavigate(href);
            }, true);

            window.addEventListener('submit', function(e) {
              var form = e.target;
              if (!form || !form.tagName || form.tagName.toLowerCase() !== 'form') return;
              var method = (form.getAttribute('method') || 'GET').toUpperCase();
              if (method === 'GET') {
                e.preventDefault();
                e.stopPropagation();
                var action = form.getAttribute('action') || CURRENT_PAGE;
                var targetObj = new URL(action, CURRENT_PAGE);
                var inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(function(input) {
                  var name = input.getAttribute('name');
                  if (name && input.value !== undefined) targetObj.searchParams.set(name, input.value);
                });
                proxyNavigate(targetObj.toString());
              }
            }, true);
          })();
        </script>
      `;

      let modifiedHtml = body;
      if (modifiedHtml.includes("<head>")) {
        modifiedHtml = modifiedHtml.replace("<head>", `<head>${baseTag}${script}`);
      } else {
        modifiedHtml = `${baseTag}${script}${modifiedHtml}`;
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
        body: modifiedHtml,
      };
    } else {
      const buffer = await response.arrayBuffer();
      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        },
        body: Buffer.from(buffer).toString("base64"),
        isBase64Encoded: true,
      };
    }
  } catch (err: any) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: `<html><body style="background:#0D0D0D;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>Unable to reach destination</h2><p style="color:#888;">${err?.message || "Gateway error"}</p></div></body></html>`,
    };
  }
}
