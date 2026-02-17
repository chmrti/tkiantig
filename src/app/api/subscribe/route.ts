import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend inside the handler to prevent build-time errors if API key is missing
export async function POST(req: NextRequest) {
    console.log("Attempting to subscribe...");

    if (!process.env.RESEND_API_KEY) {
        console.error("❌ RESEND_API_KEY is missing from environment variables.");
        return NextResponse.json({ error: 'Configuration Error: Missing API Key' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        console.log(`Sending email to ${email}...`);

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'TKi <onboarding@resend.dev>', // Should use a verified domain in prod
            to: [email],
            subject: 'Votre place est réservée.',
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="font-family: serif; color: #e8390e; font-size: 24px; margin-bottom: 24px;">Bienvenue dans le recrutement post-IA.</h1>
                    
                    <p style="line-height: 1.6; color: #444;">L'IA a banalisé l'excellence académique et la perfection syntaxique. Ce qu'elle ne peut pas reproduire, c'est votre <strong>signature décisionnelle</strong>.</p>
                    
                    <p style="line-height: 1.6; color: #444;">Vous avez fait le premier pas en rejoignant la liste d'attente TKi.</p>
                    
                    <div style="background: #f9f9f9; border-left: 3px solid #e8390e; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; font-weight: 500; color: #111;">La prochaine étape est critique.</p>
                        <p style="margin: 8px 0 0; font-size: 14px; color: #666; line-height: 1.5;">Nous ouvrons l'accès aux profils complets au compte-gouttes. Pour garantir votre place prioritaire, vous devez disposer d'un profil comportemental actif.</p>
                    </div>

                    <p style="line-height: 1.6; color: #444; margin-bottom: 30px;">La simulation dure 15 minutes. Elle ne demande aucune compétence, juste votre instinct.</p>
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="https://tkiantig.vercel.app/test" style="background: #0f0f0f; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Sécuriser mon profil maintenant →</a>
                    </div>
                    
                    <p style="font-family: serif; font-style: italic; color: #888; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                        "Ceci n'est pas un test. C'est une preuve de votre humanité."
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('❌ Resend API error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("✅ Email sent successfully:", data);
        return NextResponse.json({ data });

    } catch (e: any) {
        console.error('❌ Unexpected error subscribing:', e);
        return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
    }
}
