export interface EmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async (params: EmailParams) => {
    console.log('📧 SIMULACIÓN DE ENVÍO DE EMAIL:');
    console.log(`   PARA: ${params.to}`);
    console.log(`   ASUNTO: ${params.subject}`);
    console.log(`   CONTENIDO: ${params.text || 'Contenido HTML no mostrado'}`);

    // Aquí se integraría SendGrid o Resend en el futuro
    return { success: true, messageId: 'simulated-id' };
};

export const sendBookingConfirmation = async (guestEmail: string, bookingDetails: any) => {
    return await sendEmail({
        to: guestEmail,
        subject: `Confirmación de Reserva #${bookingDetails.id} - Residencia Éclat`,
        text: `Hola ${bookingDetails.guestName}, tu reserva para la habitación ${bookingDetails.roomName} desde ${bookingDetails.checkIn} hasta ${bookingDetails.checkOut} ha sido recibida.`,
        html: `<h1>Reserva Recibida</h1><p>Hola <strong>${bookingDetails.guestName}</strong>, tu reserva ha sido registrada correctamente.</p>`,
    });
};
