import React from 'react';

function WhySection() {
    return (
        <section className="w-full px-4 md:px-12 mb-8 mt-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Heading and Buttons */}
                    <div className="flex flex-col items-start gap-6">
                        <div className="mb-2 pl-8">
                            <span className="block text-[#00ACA8] text-2xl md:text-4xl font-semibold leading-tight">POURQUOI UNE</span>
                            <span className="block text-[#00ACA8] text-2xl md:text-4xl font-extrabold leading-tight">TELLE AUGMENTATION&nbsp;?</span>
                        </div>
                        <div className="flex flex-row mt-2">
                            <button className="bg-pink-600 text-white rounded-full px-6 py-2 text-base font-semibold shadow flex items-center hover:bg-pink-700 transition donation-button">
                                <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON RÉGULIER
                            </button>
                            <button className="bg-pink-600 text-white rounded-full px-6 py-2 text-base font-semibold shadow flex items-center hover:bg-pink-700 transition donation-button">
                                <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-5 mr-2" /> JE FAIS UN DON PONCTUEL
                            </button>
                        </div>
                    </div>
                    {/* Right Column: Two Rows */}
                    <div className="flex flex-col gap-x-5 pl-16">
                        <p className="text-gray-600 text-base break-words">
                            Exposition aux polluants environnementaux, prise d'antibiotiques<br /> dans l'enfance, perturbateurs endocriniens, sédentarité, alimentation, prédispositions génétiques… <span className="font-bold text-gray-800">De nombreuses hypothèses sont avancées, il est urgent d'agir !</span>
                        </p>
                        <p className="text-[#00ACA8] font-bold text-base md:text-lg leading-snug">
                            MAIS POUR RÉUSSIR, VOTRE DON EST INDISPENSABLE :<br />
                            LA RECHERCHE NE SE FERA PAS SANS VOUS !
                        </p>
                    </div>
                </div>
                <div className="text-center text-xl font-semibold mt-8">
                    <span className="text-gray-700 font-bold">1236</span> PERSONNES ONT RÉPONDU À NOTRE APPEL. <span className="text-[#00ACA8] font-bold">REJOIGNEZ-LES !</span>
                </div>
            </div>
        </section>
    );
}

export default WhySection;
