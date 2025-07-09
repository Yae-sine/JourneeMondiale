import React from 'react';

function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-4 px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Gustave Roussy logo */}
            <div className="flex items-center flex-shrink-0">
                <img src="images/Landing A/Logo-gustave-roussy.png" alt="Gustave Roussy" className="h-14 md:h-20 w-auto" />
            </div>
            {/* Center: Don de Confiance logo and text */}
            <div className="flex flex-col md:flex-row items-center justify-center flex-1 gap-4 md:gap-6 text-center md:text-left">
                <img src="images/Landing A/logo don de confiance.png" alt="Don de Confiance" className="h-12 md:h-16 w-auto" />
                <span className="text-xs md:text-sm text-gray-600 max-w-xl">
                    Gustave Roussy est labellisé « Don en Confiance » depuis 2009. Le Don en Confiance est un organisme de labellisation et de contrôle des associations et fondations faisant appel à la générosité du public.
                </span>
            </div>
            {/* Right: mindme logo and copyright */}
            <div className="flex items-center flex-shrink-0 gap-2">
                <img src="images/Landing A/logo mindme.svg" alt="mindme" className="h-5 md:h-6 w-auto" />
                <span className="text-xs md:text-sm text-gray-600">2025 pour Gustave Roussy</span>
            </div>
        </footer>
    );
}

export default Footer;
