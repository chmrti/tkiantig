import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend inside the handler to prevent build-time errors if API key is missing
export async function POST(req: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'TKi Team <onboarding@resend.dev>', // Should use a verified domain in prod
            to: [email],
            subject: 'Bienvenue sur TKi - Le futur du recrutement',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1 style="font-family: serif; color: #e8390e;">Bienvenue chez TKi.</h1>
                    <p>Merci de rejoindre le mouvement du recrutement post-IA.</p>
                    <p>Vous faites partie des premiers inscrits à notre plateforme.</p>
                    <br/>
                    <p><strong>Prochaine étape :</strong></p>
                    <p>Si ce n'est pas déjà fait, passez votre test comportemental complet pour obtenir votre profil (valable à vie).</p>
                    <p><a href="https://tkiantig.vercel.app/test" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Passer le test TKi</a></p>
                    <br/>
                    <p>À très vite,</p>
                    <p>L'équipe TKi</p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data });

    } catch (e) {
        console.error('Error subscribing:', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
