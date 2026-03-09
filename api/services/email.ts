import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendListingsEmail(email: string, city: string, listings: any[]) {
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0a05; color: #fdfdfd; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background: #1C1917; padding: 30px; border-radius: 16px; border: 1px solid #451A03; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #FBBF24; font-size: 24px; margin: 0;">✨ Your Verified Leads</h1>
                    <p style="color: #A8A29E; font-size: 14px; margin-top: 8px;">Here are your top 20 verified student housing results for ${city}.</p>
                </div>
                
                <div style="margin-top: 30px;">
                    ${listings.map(l => {
        const isPrivate = l.listing_type === 'private';
        const badgeBg = isPrivate ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)';
        const badgeColor = isPrivate ? '#4ADE80' : '#9CA3AF';
        const badgeText = isPrivate ? '👤 Private' : '🏢 Agency';
        const agencyLabel = (!isPrivate && l.agency_name) ? `<span style="font-size: 11px; color: #6B7280; margin-left: 8px;">by ${l.agency_name}</span>` : '';

        return `
                        <div style="padding: 20px; border-bottom: 1px solid #292524; margin-bottom: 15px; border-radius: 12px; background: #292524;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid rgba(255,255,255,0.05);">
                                        ${badgeText}
                                    </span>
                                    ${agencyLabel}
                                    <h3 style="margin: 12px 0 4px; font-size: 18px; color: #F3F4F6;">${l.title}</h3>
                                    <p style="font-size: 13px; color: #A8A29E; margin: 0 0 12px 0;">📍 ${l.zone} • ${l.size_mq} m² • ${l.room_type}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="color: #FBBF24; font-weight: bold; font-size: 20px; margin: 0;">€${l.price}</p>
                                    <p style="font-size: 11px; color: #78716C; margin: 2px 0 0 0;">/month</p>
                                </div>
                            </div>
                            
                            <p style="font-size: 13px; color: #D6D3D1; line-height: 1.5; margin: 0 0 16px 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                ${l.description || 'No description provided.'}
                            </p>
                            
                            <a href="${l.url}" style="display: inline-block; width: 100%; text-align: center; color: #1C1917; background-color: #FBBF24; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 0; border-radius: 8px; transition: opacity 0.2s;">
                                View on ${l.source === 'idealista' ? 'Idealista' : 'Immobiliare'} →
                            </a>
                        </div>
                        `;
    }).join('')}
                </div>
                
                <footer style="margin-top: 40px; text-align: center; color: #78716C; font-size: 12px;">
                    © 2024 The Om Vlogs Student Housing Finder.<br>
                    <span style="color: #57534E;">Automated finding service. We are not a real estate agency.</span>
                </footer>
            </div>
        </div>
    `;

    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: `Verified Student Housing Leads - ${city}`,
            html: html
        });
        console.log(`✅ Email sent to ${email}`);
    } catch (err) {
        console.error('❌ Failed to send email:', err);
    }
}
