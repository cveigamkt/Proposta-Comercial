import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Secrets (configure via `supabase secrets set ...`)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "contratos@seu-dominio.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const sb = SUPABASE_URL && SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function baixarComoAnexo(pdfUrl: string) {
  // Tenta baixar diretamente pela URL
  try {
    const r = await fetch(pdfUrl);
    if (r.ok) {
      const buf = new Uint8Array(await r.arrayBuffer());
      const base64 = btoa(String.fromCharCode(...buf));
      return [{ filename: "Contrato-Assinado.pdf", content: base64 }];
    }
  } catch (_) {}

  // Se falhar, tenta gerar signed URL do bucket `contratos`
  try {
    if (!sb) return [];
    const m = pdfUrl.match(/contratos\/([^?\s]+)/);
    if (m?.[1]) {
      const { data, error } = await sb.storage.from("contratos").createSignedUrl(m[1], 3600);
      if (error) return [];
      if (data?.signedUrl) {
        const r2 = await fetch(data.signedUrl);
        if (r2.ok) {
          const buf = new Uint8Array(await r2.arrayBuffer());
          const base64 = btoa(String.fromCharCode(...buf));
          return [{ filename: "Contrato-Assinado.pdf", content: base64 }];
        }
      }
    }
  } catch (_) {}
  return [];
}

serve(async (req: Request) => {
  try {
    // Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const payload = await req.json().catch(() => ({}));
    const {
      pdfUrl,
      to,
      nomeCliente,
      empresaCliente,
      subject,
      htmlBody,
    } = payload as {
      pdfUrl: string;
      to: string | string[];
      nomeCliente?: string;
      empresaCliente?: string;
      subject?: string;
      htmlBody?: string;
    };

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!pdfUrl) {
      return new Response(JSON.stringify({ error: "Missing pdfUrl" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const toList = Array.isArray(to)
      ? to.filter((x) => !!x)
      : String(to || "").split(",").map((s) => s.trim()).filter((x) => !!x);
    if (!toList.length) {
      return new Response(JSON.stringify({ error: "Missing recipient(s)" }), { status: 400 });
    }

    const attachments = await baixarComoAnexo(pdfUrl);
    const emailPayload = {
      from: FROM_EMAIL,
      to: toList,
      subject: subject || "Contrato assinado - Heat Digital",
      html:
        htmlBody ||
        `<p>Contrato assinado por ${nomeCliente || "Cliente"}${empresaCliente ? ` (${empresaCliente})` : ""}.</p><p>Link para download: <a href="${pdfUrl}" target="_blank">${pdfUrl}</a></p>`,
      ...(attachments.length ? { attachments } : {}),
    } as Record<string, unknown>;

    const sendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!sendResp.ok) {
      const t = await sendResp.text();
      return new Response(JSON.stringify({ error: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error)?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});