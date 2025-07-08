import React from 'react';

function InfoSection() {
    return (
        <section className="relative w-full h-[650px] mx-auto mt-10 rounded-3xl overflow-hidden">
            {/* Background Image */}
            <img src="images/Landing A/Visuel-1.png" alt="Jeune adulte patient" className="absolute inset-0 w-full h-full object-cover rounded-3xl z-0" />
            
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent z-10 rounded-3xl"></div>
            
            {/* Text Content Overlay: left half only */}
            <div className="relative z-20 flex items-center h-full w-full">
                <div className="w-full md:w-1/2 pl-8 pr-8 md:pl-16 md:pr-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-normal text-gray-700 leading-tight mb-1 tracking-wide">
                        AUGMENTATION INEXPLIQUÉE <br />DES CAS DE CANCER
                    </h2>
                    <h3 className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">
                        CHEZ LES JEUNES ADULTES
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed mb-3 max-w-xl">
                        À 30 ans, les projets sont infinis : acheter son premier appartement,<br /> obtenir une promotion au travail, fonder une famille, voyager...<br />
                        À 30 ans, tout commence, quand pour d'autres, tout bascule... avec <br />l'annonce d'un cancer.
                    </p>
                    <div className="mb-4 max-w-xl">
                        <p className="text-gray-700 text-lg leading-relaxed mb-2">
                            Le constat est préoccupant avec <span className="font-bold">une hausse des cas de cancer<br /></span> chez les jeunes adultes (entre 20 et 40 ans) ainsi que du nombre<br /> de décès associés : <span className="font-bold">+27,7 %* .<br /></span>
                        </p>
                        <p className="text-[#00ACA8] font-bold text-lg uppercase tracking-wide">
                            IL S'AGIT D'UN ENJEU DE SANTÉ PUBLIQUE MAJEUR !
                        </p>
                    </div>
                    <div className="rounded-lg p-4 mb-4 max-w-2xl">
                        <p className="text-gray-700 text-lg">
                            En tant qu'acteur reconnu en cancérologie, <span className="font-bold">Gustave Roussy lance <br />l'alerte</span> et mobilise ses moyens et ses talents médico-scientifiques <br />avec <span className="font-bold">le programme précurseur « Un cancer à 30 ans »</span>. Notre<br /> objectif est de comprendre les causes favorisant l'apparition du<br /> cancer parmi cette tranche d'âge, ce qui nous permettra de<br /> développer des traitements sur mesure pour ces patients et de<br /> sauver plus de vies, tout en préservant leur qualité de vie.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default InfoSection;
