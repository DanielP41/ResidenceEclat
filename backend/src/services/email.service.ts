import { Resend } from 'resend';
import logger from '../config/logger';

let resend: Resend | null = null;
const getResendClient = () => {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};
const EMAIL_FROM = process.env.EMAIL_FROM || 'Residencia Éclat <noreply@residencia-eclat.com>';

export interface EmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface BookingDetails {
    id: number;
    guestName: string;
    guestEmail: string;
    roomName: string;
    residenceName: string;
    checkIn: string;
    checkOut: string;
    totalNights: number;
    totalPrice: number;
}

const baseStyles = `
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #1a1a2e; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 3px; }
    .content { padding: 40px 30px; color: #333; }
    .content h2 { color: #1a1a2e; font-weight: 400; margin-top: 0; }
    .details-box { background-color: #f8f8f8; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0; }
    .details-box p { margin: 8px 0; }
    .details-box strong { color: #1a1a2e; }
    .highlight { color: #d4af37; font-weight: 600; }
    .footer { background-color: #1a1a2e; color: #888; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #d4af37; text-decoration: none; }
    .btn { display: inline-block; background-color: #d4af37; color: #1a1a2e; padding: 12px 30px; text-decoration: none; font-weight: 600; margin-top: 20px; }
`;

const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RESIDENCIA ÉCLAT</h1>
        </div>
        ${content}
        <div class="footer">
            <p>© ${new Date().getFullYear()} Residencia Éclat. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no responder directamente.</p>
            <p><a href="#">Política de Privacidad</a> | <a href="#">Términos y Condiciones</a></p>
        </div>
    </div>
</body>
</html>
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sendEmailOnce = async (params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const emailOptions: {
        from: string; to: string; subject: string; text?: string; html?: string;
    } = { from: EMAIL_FROM, to: params.to, subject: params.subject };

    if (params.html) emailOptions.html = params.html;
    if (params.text) emailOptions.text = params.text;

    const client = getResendClient();
    if (!client) {
        return { success: false, error: 'Configuración de email incompleta' };
    }

    const { data, error } = await client.emails.send(emailOptions as any);
    if (error) return { success: false, error: error.message };

    return { success: true, messageId: data?.id };
};

export const sendEmail = async (params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const isPlaceholderKey = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_xxxxxxxxxxxx';

    if (isPlaceholderKey) {
        if (process.env.NODE_ENV === 'production') {
            logger.error('RESEND_API_KEY no configurada en producción');
            return { success: false, error: 'Configuración de email incompleta' };
        }
        logger.debug('Email simulado (dev)', { to: params.to, subject: params.subject });
        return { success: true, messageId: 'dev-simulated' };
    }

    const MAX_ATTEMPTS = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await sendEmailOnce(params);
            if (result.success) {
                logger.info('Email enviado', { messageId: result.messageId, to: params.to, attempt });
                return result;
            }
            lastError = result.error ?? 'Error desconocido';
        } catch (err) {
            lastError = err instanceof Error ? err.message : 'Error desconocido';
        }

        if (attempt < MAX_ATTEMPTS) {
            const delay = 500 * 2 ** (attempt - 1); // 500ms, 1000ms
            logger.warn(`Reintentando envío de email (intento ${attempt}/${MAX_ATTEMPTS})`, { to: params.to, delay });
            await sleep(delay);
        }
    }

    logger.error('Error enviando email tras reintentos', { error: lastError, to: params.to });
    return { success: false, error: lastError };
};

export const sendBookingConfirmation = async (booking: BookingDetails) => {
    const content = `
        <div class="content">
            <h2>¡Reserva Confirmada!</h2>
            <p>Hola <strong>${booking.guestName}</strong>,</p>
            <p>Tu reserva ha sido recibida exitosamente. A continuación los detalles:</p>

            <div class="details-box">
                <p><strong>Número de Reserva:</strong> <span class="highlight">#${booking.id}</span></p>
                <p><strong>Sede:</strong> ${booking.residenceName}</p>
                <p><strong>Habitación:</strong> ${booking.roomName}</p>
                <p><strong>Check-in:</strong> ${booking.checkIn}</p>
                <p><strong>Check-out:</strong> ${booking.checkOut}</p>
                <p><strong>Noches:</strong> ${booking.totalNights}</p>
                <p><strong>Total:</strong> <span class="highlight">$${booking.totalPrice.toLocaleString()}</span></p>
            </div>

            <p>Te esperamos para brindarte una experiencia única de hospedaje de lujo.</p>
            <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
        </div>
    `;

    const text = `
Reserva Confirmada - Residencia Éclat

Hola ${booking.guestName},

Tu reserva #${booking.id} ha sido confirmada.

Detalles:
- Sede: ${booking.residenceName}
- Habitación: ${booking.roomName}
- Check-in: ${booking.checkIn}
- Check-out: ${booking.checkOut}
- Noches: ${booking.totalNights}
- Total: $${booking.totalPrice.toLocaleString()}

¡Te esperamos!
    `.trim();

    return await sendEmail({
        to: booking.guestEmail,
        subject: `Reserva #${booking.id} Confirmada - Residencia Éclat`,
        text,
        html: emailTemplate(content),
    });
};

export const sendBookingCancellation = async (booking: BookingDetails, reason?: string) => {
    const content = `
        <div class="content">
            <h2>Reserva Cancelada</h2>
            <p>Hola <strong>${booking.guestName}</strong>,</p>
            <p>Te informamos que tu reserva ha sido cancelada.</p>

            <div class="details-box">
                <p><strong>Número de Reserva:</strong> #${booking.id}</p>
                <p><strong>Sede:</strong> ${booking.residenceName}</p>
                <p><strong>Habitación:</strong> ${booking.roomName}</p>
                <p><strong>Fechas:</strong> ${booking.checkIn} - ${booking.checkOut}</p>
                ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
            </div>

            <p>Si esto fue un error o deseas realizar una nueva reserva, no dudes en contactarnos.</p>
        </div>
    `;

    const text = `
Reserva Cancelada - Residencia Éclat

Hola ${booking.guestName},

Tu reserva #${booking.id} ha sido cancelada.

Detalles:
- Sede: ${booking.residenceName}
- Habitación: ${booking.roomName}
- Fechas: ${booking.checkIn} - ${booking.checkOut}
${reason ? `- Motivo: ${reason}` : ''}

Si tienes consultas, contáctanos.
    `.trim();

    return await sendEmail({
        to: booking.guestEmail,
        subject: `Reserva #${booking.id} Cancelada - Residencia Éclat`,
        text,
        html: emailTemplate(content),
    });
};

export const sendCheckInReminder = async (booking: BookingDetails) => {
    const content = `
        <div class="content">
            <h2>Recordatorio de Check-in</h2>
            <p>Hola <strong>${booking.guestName}</strong>,</p>
            <p>Te recordamos que tu estadía en Residencia Éclat comienza pronto.</p>

            <div class="details-box">
                <p><strong>Número de Reserva:</strong> <span class="highlight">#${booking.id}</span></p>
                <p><strong>Sede:</strong> ${booking.residenceName}</p>
                <p><strong>Habitación:</strong> ${booking.roomName}</p>
                <p><strong>Fecha de llegada:</strong> <span class="highlight">${booking.checkIn}</span></p>
            </div>

            <p><strong>Horario de check-in:</strong> A partir de las 15:00 hs</p>
            <p>¡Te esperamos para una experiencia inolvidable!</p>
        </div>
    `;

    return await sendEmail({
        to: booking.guestEmail,
        subject: `Recordatorio: Tu check-in es el ${booking.checkIn} - Residencia Éclat`,
        html: emailTemplate(content),
    });
};
