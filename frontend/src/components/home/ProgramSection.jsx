import React from 'react';

function ProgramSection() {
    return (
        <>
            <section className="py-12 w-full flex flex-col items-center justify-center bg-transparent">
                <div className="flex flex-col items-center w-full">
                    {/* Headline with background blocks */}
                    <div className="relative flex flex-col items-center w-full">
                        <div className="relative z-10 mr-16 mb-3">
                            <span className="inline-block px-5 py-2 bg-[#A7ECEE] text-gray-600 text-4xl md:text-5xl font-bold uppercase tracking-tight rounded-t-md text-center">
                                UN CANCER
                            </span>
                        </div>
                        <div className="relative -mt-4 z-20">
                            <span className="inline-block px-12 py-2 bg-[#00ACA8] text-white text-4xl md:text-5xl font-bold uppercase tracking-tight rounded-b-md text-center">
                                À 30 ANS
                            </span>
                        </div>
                    </div>
                    {/* Subtitle */}
                    <p className="mt-8 text-center text-2xl md:text-3xl text-gray-500 font-normal max-w-3xl">
                        Un programme révolutionnaire pour les générations de demain
                    </p>
                    {/* Description */}
                    <p className="mt-4 text-center text-lg md:text-xl text-gray-600 font-normal max-w-2xl">
                        Aujourd'hui, malgré des avancées significatives en oncologie, le pronostic de nombreux cancers des 20-40 ans est <span className="font-bold">plus sombre</span> que pour des tumeurs similaires chez les enfants ou les personnes âgées.
                    </p>
                </div>
            </section>

            <section className="py-12 w-full flex justify-center bg-transparent">
                <div className="bg-white rounded-2xl shadow-lg max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                    {/* Left Column */}
                    <div className="flex flex-col h-full justify-between">
                        {/* Cyan box with intro text */}
                        <div className="bg-[#E6FAFA] rounded-lg p-6 mb-8">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Avec notre programme « Un cancer à 30 ans », <span className="font-bold">nous développons la médecine de précision spécifiquement chez les jeunes adultes</span> pour répondre au défi croissant des cancers diagnostiqués avant l'âge de 40 ans. Ce programme se divise en <span className="font-bold">trois axes afin de répondre de façon globale à la problématique.</span>
                            </p>
                        </div>
                        {/* 3 axes list */}
                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00ACA8] flex items-center justify-center text-white font-bold text-lg">1</div>
                                <div>
                                    <span className="font-bold text-[#00ACA8]">Identifier les causes des cancers à début précoce</span> <span className="text-gray-700">pour réduire le risque de cancer et mieux diagnostiquer les cancers à un stade précoce.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00ACA8] flex items-center justify-center text-white font-bold text-lg">2</div>
                                <div>
                                    <span className="font-bold text-[#00ACA8]">Évaluer de nouvelles cibles thérapeutiques parmi cette tranche de la population</span> <span className="text-gray-700">en identifiant de nouveaux biomarqueurs de réponse et de résistance au traitement.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00ACA8] flex items-center justify-center text-white font-bold text-lg">3</div>
                                <div>
                                    <span className="font-bold text-[#00ACA8]">Résoudre les problèmes de survie spécifiques à cette population</span> <span className="text-gray-700">, notamment les problèmes de fertilité, pour mieux adapter les soins.</span>
                                </div>
                            </div>
                        </div>
                        {/* Buttons */}
                        <div className="flex flex-row gap-4 mt-4 justify-center">
                            <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold shadow-md hover:bg-pink-800 flex items-center justify-center donation-button">
                                <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON RÉGULIER
                            </button>
                            <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold shadow-md hover:bg-pink-800 flex items-center justify-center donation-button">
                                <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON PONCTUEL
                            </button>
                        </div>
                    </div>
                    {/* Right Column: Video */}
                    <div className="flex flex-col items-center justify-center relative">
                        <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
                            <img src="images/Landing A/Dr El Rassy.png" alt="Dr El Rassy" className="w-full h-auto object-cover rounded-2xl" />
                            {/* Play button overlay */}
                            <button className="absolute inset-0 flex items-center justify-center focus:outline-none" aria-label="Play video">
                                <span className="bg-white bg-opacity-80 rounded-full p-4 shadow-lg flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[#00ACA8]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </span>
                            </button>
                            {/* Cyan label */}
                            <div className="absolute bottom-4 left-4 bg-[#00ACA8] text-white font-bold px-4 py-2 rounded">
                                DR EL-RASSY,<br /> ONCOLOGUE
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ProgramSection;
