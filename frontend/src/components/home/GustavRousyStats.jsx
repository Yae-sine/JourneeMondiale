import React from 'react';

function GustavRousyStats() {
    return (
        <section className="relative w-full h-full md:h-[600px] lg:h-[650px] flex items-center overflow-hidden mt-10 mb-10">
            {/* Background image */}
            <img src="images/Landing A/Visuel_bas.png" alt="Jeune adulte" className="absolute inset-0 w-full h-auto object-cover z-0" />
            {/* Content */}
            <div className="relative z-20 flex flex-col justify-center h-full w-full max-w-7xl mx-auto px-8 mb-12">
                <div className="max-w-3xl pt-8 mb-8 pl-8">
                    <h2 className="text-white text-3xl md:text-5xl font-light leading-tight mb-2 tracking-wide">
                        GUSTAVE ROUSSY, L'EXCELLENCE<br />
                        AU SERVICE DE LA PRISE<br />
                        EN CHARGE DU CANCER<br />
                        <span className="font-extrabold text-white">CHEZ LES JEUNES ADULTES</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mt-12 w-full max-w-3xl mb-8 pt-8">
                    {/* Left column */}
                    <div className="flex flex-col gap-10 mb-12 pl-8">
                        {/* Block 1 */}
                        <div className="flex items-center gap-4 min-w-[180px]">
                            <img src="images/Landing A/Groupe 3050.svg" alt="Centre Européen" className="w-16 h-16 flex-shrink-0" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-3">
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-white text-3xl font-bold">1<sup className="text-lg font-normal align-super">er</sup><sub className="text-white text-base font-bold"> CENTRE EUROPÉEN</sub></span>
                                    </div>
                                </div>
                                <div className="text-white text-xs font-normal leading-tight">de lutte contre le cancer<br />et 4<sup>e</sup> au rang mondial</div>
                            </div>
                        </div>
                        {/* Block 2 */}
                        <div className="flex items-center gap-4 min-w-[180px] pt-10">
                            <img src="images/Landing A/Groupe 3052.svg" alt="Soignants et médecins" className="w-16 h-16 flex-shrink-0" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-white text-3xl font-bold">1 890</span>
                                </div>
                                <div className="text-white text-xs font-normal leading-tight">soignants et médecins</div>
                            </div>
                        </div>
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-10 mb-12">
                        {/* Block 3 */}
                        <div className="flex items-center gap-4 min-w-[180px]">
                            <img src="images/Landing A/Groupe 3051.svg" alt="100 ans" className="w-16 h-16 flex-shrink-0" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-white text-3xl font-bold">100<sub className="text-white text-base font-bold"> ANS</sub></span>
                                </div>
                                <div className="text-white text-xs font-normal leading-tight">de recherche et d'innovation pour<br />guérir le cancer au 21<sup>e</sup> siècle</div>
                            </div>
                        </div>
                        {/* Block 4 */}
                        <div className="flex items-center gap-4 min-w-[180px] pt-10">
                            <img src="images/Landing A/Groupe 3053.svg" alt="Équipes de recherche" className="w-16 h-16 flex-shrink-0" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-white text-3xl font-bold">35</span>
                                </div>
                                <div className="text-white text-xs font-normal leading-tight">équipes de recherche</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default GustavRousyStats;
