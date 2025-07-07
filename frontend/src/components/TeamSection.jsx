import React from 'react';

function TeamSection() {
    return (
        <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-12">
                <div>
                    <img src="images/Landing A/ACH_4335.png" alt="Gustave Roussy" className="w-full h-auto object-cover rounded-t-3xl" />
                </div>
                <div>
                    <div>
                        <div>
                            <p className="text-gray-500 text-2xl font-bold">
                                NOUS POUVONS TOUS FAIRE <br /> ÉQUIPE AVEC GUSTAVE ROUSSY :
                            </p>
                            <p className="text-white bg-[#00ACA8] font-bold text-2xl">
                                CHOISISSEZ COMMENT <br />VOUS MOBILISER !
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-12">
                            <div>
                                <button className="bg-pink-600 text-white rounded-full px-8 py-2 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/Groupe 3022.svg" alt="Heart" className="w-5 h-4 mr-2" /> JE COURS POUR GUSTAVE ROUSSY
                                </button>
                                <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/picto coeur.svg" alt="Heart" className="w-5 h-4 mr-2" /> JE MOBILISE MON ENTREPRISE CONTRE LE CANCER
                                </button>
                            </div>
                            <div>
                                <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/Groupe 3018.svg" alt="Heart" className="w-5 h-4 mr-2" /> JE CRÉÉ MA PAGE DE COLLECTE
                                </button>
                                <button className="bg-pink-600 text-white rounded-full px-8 py-3 text-base font-semibold mb-8 shadow-md hover:bg-pink-800 flex items-center donation-button">
                                    <img src="images/Landing A/Groupe 3020.svg" alt="Heart" className="w-5 h-4 mr-2" /> JE PARTAGE MON ENGAGEMENT SUR MES RÉSEAUX
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TeamSection;
