import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportEmailRequest {
  recipientEmail: string;
  reportData: any;
  reportDate: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipientEmail, reportData, reportDate }: ReportEmailRequest = await req.json();

    if (!recipientEmail || !reportData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Calculate financial summary
    const costoPersonalCampo = reportData.personalCampo?.reduce(
      (sum: number, p: any) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora),
      0
    ) || 0;

    const costoPersonalAdmin = reportData.personalAdmin?.reduce(
      (sum: number, p: any) => sum + ((p.horasNormales + p.horasExtras) * p.tarifaHora),
      0
    ) || 0;

    const costoEquipos = reportData.equipos?.reduce(
      (sum: number, e: any) => sum + (e.horasTrabajo * e.costoHora),
      0
    ) || 0;

    const costoMateriales = reportData.materiales?.reduce(
      (sum: number, m: any) => sum + m.costoTotal,
      0
    ) || 0;

    const costoTotal = costoPersonalCampo + costoPersonalAdmin + costoEquipos + costoMateriales;

    // Generate HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .section { background: #f9fafb; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
          .section h2 { margin-top: 0; color: #1e40af; }
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .summary-item { background: white; padding: 10px; border-radius: 4px; }
          .total { background: #fee2e2; border-left-color: #dc2626; padding: 15px; font-size: 18px; font-weight: bold; }
          .label { color: #6b7280; font-size: 14px; }
          .value { color: #111827; font-size: 16px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Reporte Diario de Obra</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${reportData.proyecto || 'Villa Marina Fase 4'}</p>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${reportDate}</p>
          </div>

          <div class="section">
            <h2>Información General</h2>
            <p><strong>Cliente:</strong> ${reportData.cliente || 'Grupo VerdeAzul'}</p>
            <p><strong>Supervisor:</strong> ${reportData.supervisor || 'N/A'}</p>
            <p><strong>Clima:</strong> ${reportData.clima || 'N/A'}</p>
          </div>

          ${reportData.personalCampo && reportData.personalCampo.length > 0 ? `
          <div class="section">
            <h2>Personal de Campo (${reportData.personalCampo.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Horas</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.personalCampo.map((p: any) => `
                  <tr>
                    <td>${p.nombre}</td>
                    <td>${p.tipo}</td>
                    <td>${p.horasNormales + p.horasExtras}h</td>
                    <td>B/. ${((p.horasNormales + p.horasExtras) * p.tarifaHora).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${reportData.equipos && reportData.equipos.length > 0 ? `
          <div class="section">
            <h2>Equipos (${reportData.equipos.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Operador</th>
                  <th>Horas</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.equipos.map((e: any) => `
                  <tr>
                    <td>${e.tipo}</td>
                    <td>${e.operador}</td>
                    <td>${e.horasTrabajo}h</td>
                    <td>B/. ${(e.horasTrabajo * e.costoHora).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <h2>Resumen Financiero</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Personal Campo</div>
                <div class="value">B/. ${costoPersonalCampo.toFixed(2)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Personal Admin</div>
                <div class="value">B/. ${costoPersonalAdmin.toFixed(2)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Equipos</div>
                <div class="value">B/. ${costoEquipos.toFixed(2)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Materiales</div>
                <div class="value">B/. ${costoMateriales.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div class="section total">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>COSTO TOTAL DEL DÍA:</span>
              <span style="color: #dc2626;">B/. ${costoTotal.toFixed(2)}</span>
            </div>
          </div>

          ${reportData.observaciones ? `
          <div class="section">
            <h2>Observaciones</h2>
            <p>${reportData.observaciones}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Este es un reporte automático generado por el Sistema de Control de Obra</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Mailgun
    // For now, return the email HTML that can be used with any service

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Report prepared for email',
        emailData: {
          to: recipientEmail,
          subject: `Reporte Diario - ${reportData.proyecto || 'Villa Marina'} - ${reportDate}`,
          html: emailHtml,
          text: `Reporte diario para ${reportDate}. Costo total: B/. ${costoTotal.toFixed(2)}`
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error processing report email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
