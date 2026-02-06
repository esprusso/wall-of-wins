
import './globals.css';
import { Playfair_Display, Nunito, Patrick_Hand } from 'next/font/google';

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-playfair',
});

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    variable: '--font-nunito',
});

const patrickHand = Patrick_Hand({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-patrick',
});

export const metadata = {
    title: 'Wall of Wins',
    description: 'Track your daily wins!',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        title: 'Wins',
        statusBarStyle: 'black-translucent',
    },
    icons: {
        icon: '/favicon-96.png',
        apple: '/apple.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${playfair.variable} ${nunito.variable} ${patrickHand.variable}`}>{children}</body>
        </html>
    );
}
